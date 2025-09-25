import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePhotoStore } from '@/store/photoStore';
import { useUIStore } from '@/store/uiStore';
import { ViewerControls } from './ViewerControls';
import { PhotoInfo } from './PhotoInfo';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';

export const PhotoViewer: React.FC = () => {
  const { selectedPhoto, photos, setSelectedPhoto } = usePhotoStore();
  const { isPhotoViewerOpen, closePhotoViewer, showPhotoInfo } = useUIStore();

  const currentIndex = selectedPhoto ? photos.findIndex(p => p.id === selectedPhoto.id) : -1;

  const navigateToPhoto = useCallback((direction: 'prev' | 'next') => {
    if (!selectedPhoto || photos.length === 0) return;

    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % photos.length
      : (currentIndex - 1 + photos.length) % photos.length;

    setSelectedPhoto(photos[newIndex]);
  }, [selectedPhoto, photos, currentIndex, setSelectedPhoto]);

  const handleClose = useCallback(() => {
    closePhotoViewer();
    setSelectedPhoto(null);
  }, [closePhotoViewer, setSelectedPhoto]);

  // Keyboard shortcuts
  useHotkeys('escape', handleClose);
  useHotkeys('arrowleft', () => navigateToPhoto('prev'));
  useHotkeys('arrowright', () => navigateToPhoto('next'));

  // Prevent body scroll when viewer is open
  useEffect(() => {
    if (isPhotoViewerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isPhotoViewerOpen]);

  if (!isPhotoViewerOpen || !selectedPhoto) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
        onClick={handleClose}
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
          onClick={handleClose}
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Navigation buttons */}
        {photos.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                navigateToPhoto('prev');
              }}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                navigateToPhoto('next');
              }}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}

        {/* Main image container */}
        <div 
          className="flex items-center justify-center h-full p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            key={selectedPhoto.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-full max-h-full"
          >
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.filename}
              className="max-w-full max-h-full object-contain"
              draggable={false}
            />
          </motion.div>
        </div>

        {/* Controls */}
        <ViewerControls photo={selectedPhoto} />

        {/* Photo info panel */}
        <AnimatePresence>
          {showPhotoInfo && (
            <PhotoInfo photo={selectedPhoto} />
          )}
        </AnimatePresence>

        {/* Photo counter */}
        {photos.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm"
          >
            {currentIndex + 1} of {photos.length}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};