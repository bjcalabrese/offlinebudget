import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useUIStore } from '@/store/uiStore';
import { usePhotoStore } from '@/store/photoStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Image, CheckCircle, AlertCircle } from 'lucide-react';
import { Photo, UploadProgress } from '@/types/photo';

export const UploadModal: React.FC = () => {
  const { isUploadModalOpen, closeUploadModal } = useUIStore();
  const { addPhotos, uploadProgress, addUploadProgress, updateUploadProgress, removeUploadProgress } = usePhotoStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const uploadId = Math.random().toString(36).substr(2, 9);
      
      // Add upload progress
      addUploadProgress({
        id: uploadId,
        filename: file.name,
        progress: 0,
        status: 'uploading'
      });

      // Simulate upload process
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        
        // Create photo object
        const newPhoto: Photo = {
          id: Math.random().toString(36).substr(2, 9),
          filename: file.name,
          url: result,
          thumbnailUrl: result,
          size: file.size,
          dimensions: { width: 1920, height: 1080 }, // Would be calculated from actual image
          createdAt: new Date(),
          takenAt: new Date(),
          tags: [],
          albumIds: [],
          isFavorite: false
        };

        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 30;
          if (progress >= 100) {
            progress = 100;
            updateUploadProgress(uploadId, { progress, status: 'completed' });
            addPhotos([newPhoto]);
            
            // Remove from upload progress after delay
            setTimeout(() => {
              removeUploadProgress(uploadId);
            }, 2000);
            
            clearInterval(interval);
          } else {
            updateUploadProgress(uploadId, { progress });
          }
        }, 200);
      };
      
      reader.readAsDataURL(file);
    });
  }, [addPhotos, addUploadProgress, updateUploadProgress, removeUploadProgress]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: true
  });

  return (
    <Dialog open={isUploadModalOpen} onOpenChange={closeUploadModal}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Upload Photos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Drop zone */}
          <motion.div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input {...getInputProps()} />
            
            <div className="text-center">
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: isDragActive ? 1.1 : 1 }}
                className="mx-auto w-12 h-12 mb-4 rounded-full bg-primary/10 flex items-center justify-center"
              >
                <Image className="h-6 w-6 text-primary" />
              </motion.div>
              
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
                Supports JPEG, PNG, WebP, and GIF files
              </p>
            </div>
          </motion.div>

          {/* Upload progress */}
          {uploadProgress.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Uploading Files</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <AnimatePresence>
                  {uploadProgress.map((upload) => (
                    <motion.div
                      key={upload.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center space-x-3 p-3 border rounded-lg"
                    >
                      {upload.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : upload.status === 'error' ? (
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin flex-shrink-0" />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{upload.filename}</p>
                        <Progress value={upload.progress} className="h-1 mt-1" />
                      </div>
                      
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {Math.round(upload.progress)}%
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};