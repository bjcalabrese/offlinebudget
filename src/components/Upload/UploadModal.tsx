import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useUIStore } from '@/store/uiStore';
import { usePhotoStore } from '@/store/photoStore';
import { useAlbumStore } from '@/store/albumStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Image, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { Photo, UploadProgress } from '@/types/photo';
import { Album } from '@/types/album';
import { AlbumAssignmentModal } from './AlbumAssignmentModal';
import { fileManager } from '@/services/fileManager';

interface ProcessingOptions {
  generateThumbnails: boolean;
  extractMetadata: boolean;
  compressImages: boolean;
  quality: number;
}

export const UploadModal: React.FC = () => {
  const { isUploadModalOpen, closeUploadModal } = useUIStore();
  const { addPhotos, uploadProgress, addUploadProgress, updateUploadProgress, removeUploadProgress } = usePhotoStore();
  const { addAlbum, addPhotosToAlbum } = useAlbumStore();
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showAlbumAssignment, setShowAlbumAssignment] = useState(false);
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>({
    generateThumbnails: true,
    extractMetadata: true,
    compressImages: false,
    quality: 85
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Validate files
    const validFiles = acceptedFiles.filter(file => {
      const validation = fileManager.validateFile(file);
      if (!validation.isValid) {
        console.error(`Invalid file ${file.name}:`, validation.errors);
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);
    
    if (validFiles.length > 0) {
      setShowAlbumAssignment(true);
    }
  }, []);

  const handleAlbumAssignment = async (
    albumIds: string[], 
    createNewAlbum?: string,
    autoRules?: { byDate: boolean; byLocation: boolean; byFilename: boolean }
  ) => {
    setShowAlbumAssignment(false);
    
    let finalAlbumIds = [...albumIds];
    
    // Create new album if specified
    if (createNewAlbum) {
      const newAlbum: Album = {
        id: Math.random().toString(36).substr(2, 9),
        name: createNewAlbum,
        photoIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isSmartAlbum: false
      };
      
      await addAlbum(newAlbum);
      finalAlbumIds.push(newAlbum.id);
    }
    
    // Process files
    processFiles(selectedFiles, finalAlbumIds, autoRules);
  };

  const processFiles = async (
    files: File[], 
    albumIds: string[],
    autoRules?: { byDate: boolean; byLocation: boolean; byFilename: boolean }
  ) => {
    const newPhotos: Photo[] = [];
    
    for (const file of files) {
      const uploadId = Math.random().toString(36).substr(2, 9);
      
      // Add upload progress
      addUploadProgress({
        id: uploadId,
        filename: file.name,
        progress: 0,
        status: 'uploading'
      });

      try {
        // Extract metadata
        updateUploadProgress(uploadId, { status: 'processing', progress: 20 });
        const metadata = await fileManager.extractMetadata(file);
        
        // Generate thumbnails
        updateUploadProgress(uploadId, { progress: 40 });
        const thumbnails = await fileManager.generateThumbnails(file);
        
        // Optionally compress image
        let finalBlob: Blob = file;
        if (processingOptions.compressImages) {
          updateUploadProgress(uploadId, { progress: 60 });
          finalBlob = await fileManager.compressImage(file, processingOptions.quality);
        }
        
        // Create data URLs for display
        updateUploadProgress(uploadId, { progress: 80 });
        const url = await fileManager.blobToDataURL(finalBlob);
        const thumbnailUrl = await fileManager.blobToDataURL(thumbnails.medium);
        
        // Auto-generate tags from filename if enabled
        let tags: string[] = [];
        if (autoRules?.byFilename) {
          tags = file.name
            .replace(/\.[^/.]+$/, '') // Remove extension
            .split(/[\s_-]+/) // Split on spaces, underscores, hyphens
            .filter(tag => tag.length > 2)
            .slice(0, 5); // Limit to 5 tags
        }
        
        // Create photo object
        const newPhoto: Photo = {
          id: Math.random().toString(36).substr(2, 9),
          filename: file.name,
          url,
          thumbnailUrl,
          fileBlob: finalBlob,
          thumbnailBlob: thumbnails.medium,
          size: file.size,
          dimensions: metadata.dimensions,
          createdAt: new Date(),
          uploadedAt: new Date(),
          takenAt: file.lastModified ? new Date(file.lastModified) : new Date(),
          tags,
          albumIds,
          metadata: {
            exif: metadata.exif,
            location: metadata.location
          },
          isFavorite: false
        };

        newPhotos.push(newPhoto);
        
        // Update progress to complete
        updateUploadProgress(uploadId, { status: 'completed', progress: 100 });
        
        // Add photos to albums
        if (albumIds.length > 0) {
          albumIds.forEach(albumId => {
            addPhotosToAlbum(albumId, [newPhoto.id]);
          });
        }
        
      } catch (error) {
        console.error('Error processing file:', error);
        updateUploadProgress(uploadId, { 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }
    
    // Add all photos to store
    if (newPhotos.length > 0) {
      await addPhotos(newPhotos);
    }
    
    // Clean up after a delay
    setTimeout(() => {
      uploadProgress.forEach(upload => {
        if (upload.status === 'completed' || upload.status === 'error') {
          removeUploadProgress(upload.id);
        }
      });
      
      // Reset state
      setSelectedFiles([]);
      
      // Close modal if all uploads are done
      if (uploadProgress.every(upload => upload.status === 'completed' || upload.status === 'error')) {
        setTimeout(() => {
          closeUploadModal();
        }, 1000);
      }
    }, 2000);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: true
  });

  const handleClose = () => {
    setSelectedFiles([]);
    setShowAlbumAssignment(false);
    closeUploadModal();
  };

  return (
    <>
      <Dialog open={isUploadModalOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload Photos
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Drag & Drop Area */}
            {selectedFiles.length === 0 && uploadProgress.length === 0 && (
              <motion.div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
                  ${isDragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                  }
                `}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <input {...getInputProps()} />
                
                <motion.div
                  animate={{ 
                    y: isDragActive ? -5 : 0,
                    scale: isDragActive ? 1.05 : 1 
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Upload className={`h-12 w-12 mx-auto mb-4 ${
                    isDragActive ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  
                  <h3 className="text-lg font-medium mb-2">
                    {isDragActive ? 'Drop photos here' : 'Drag & drop photos here'}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4">
                    or click to select files from your computer
                  </p>
                  
                  <Button variant="outline">
                    Choose Files
                  </Button>
                  
                  <p className="text-xs text-muted-foreground mt-4">
                    Supports JPEG, PNG, WebP, and GIF files (max 50MB each)
                  </p>
                </motion.div>
              </motion.div>
            )}

            {/* Processing Options */}
            {selectedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 p-4 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  <span className="font-medium">Processing Options</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={processingOptions.generateThumbnails}
                      onChange={(e) => setProcessingOptions(prev => ({
                        ...prev,
                        generateThumbnails: e.target.checked
                      }))}
                    />
                    <span className="text-sm">Generate thumbnails</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={processingOptions.extractMetadata}
                      onChange={(e) => setProcessingOptions(prev => ({
                        ...prev,
                        extractMetadata: e.target.checked
                      }))}
                    />
                    <span className="text-sm">Extract metadata</span>
                  </label>
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={processingOptions.compressImages}
                      onChange={(e) => setProcessingOptions(prev => ({
                        ...prev,
                        compressImages: e.target.checked
                      }))}
                    />
                    <span className="text-sm">Compress images</span>
                  </label>
                  
                  {processingOptions.compressImages && (
                    <div className="ml-6">
                      <label className="text-xs text-muted-foreground">
                        Quality: {processingOptions.quality}%
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={processingOptions.quality}
                        onChange={(e) => setProcessingOptions(prev => ({
                          ...prev,
                          quality: parseInt(e.target.value)
                        }))}
                        className="w-full mt-1"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Upload progress */}
            {uploadProgress.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Processing Files</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <AnimatePresence>
                    {uploadProgress.map((upload) => (
                      <motion.div
                        key={upload.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 border rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm truncate">{upload.filename}</span>
                          <div className="flex items-center">
                            {upload.status === 'completed' && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            {upload.status === 'error' && (
                              <AlertCircle className="h-4 w-4 text-destructive" />
                            )}
                          </div>
                        </div>
                        
                        {upload.status !== 'completed' && upload.status !== 'error' && (
                          <Progress value={upload.progress} className="h-2" />
                        )}
                        
                        {upload.status === 'error' && upload.error && (
                          <p className="text-xs text-destructive mt-1">{upload.error}</p>
                        )}
                        
                        <p className="text-xs text-muted-foreground mt-1 capitalize">
                          {upload.status}
                        </p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Album Assignment Modal */}
      <AlbumAssignmentModal
        isOpen={showAlbumAssignment}
        onClose={() => setShowAlbumAssignment(false)}
        onAssign={handleAlbumAssignment}
        selectedFiles={selectedFiles}
      />
    </>
  );
};