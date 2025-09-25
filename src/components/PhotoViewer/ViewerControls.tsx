import React from 'react';
import { motion } from 'framer-motion';
import { Photo } from '@/types/photo';
import { usePhotoStore } from '@/store/photoStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Download, 
  Share, 
  Info,
  Star,
  Trash2,
  RotateCcw,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface ViewerControlsProps {
  photo: Photo;
}

export const ViewerControls: React.FC<ViewerControlsProps> = ({ photo }) => {
  const { updatePhoto, deletePhoto } = usePhotoStore();
  const { togglePhotoInfo, showPhotoInfo } = useUIStore();

  const handleFavoriteToggle = () => {
    updatePhoto(photo.id, { isFavorite: !photo.isFavorite });
  };

  const handleDownload = () => {
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = photo.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: photo.filename,
          text: `Check out this photo: ${photo.filename}`,
          url: photo.url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      try {
        await navigator.clipboard.writeText(photo.url);
        // You could show a toast notification here
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${photo.filename}?`)) {
      deletePhoto(photo.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-black/60 backdrop-blur-sm rounded-full p-2"
    >
      {/* Favorite */}
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white/20"
        onClick={handleFavoriteToggle}
      >
        <Heart 
          className={`h-5 w-5 ${photo.isFavorite ? 'fill-red-500 text-red-500' : ''}`} 
        />
      </Button>

      {/* Download */}
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white/20"
        onClick={handleDownload}
      >
        <Download className="h-5 w-5" />
      </Button>

      {/* Share */}
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white/20"
        onClick={handleShare}
      >
        <Share className="h-5 w-5" />
      </Button>

      {/* Add to Album */}
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white/20"
      >
        <Star className="h-5 w-5" />
      </Button>

      {/* Info toggle */}
      <Button
        variant="ghost"
        size="icon"
        className={`text-white hover:bg-white/20 ${showPhotoInfo ? 'bg-white/20' : ''}`}
        onClick={togglePhotoInfo}
      >
        <Info className="h-5 w-5" />
      </Button>

      {/* Zoom controls (placeholder for future implementation) */}
      <div className="w-px h-6 bg-white/20 mx-1" />
      
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white/20"
      >
        <ZoomOut className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white/20"
      >
        <ZoomIn className="h-5 w-5" />
      </Button>

      {/* Delete */}
      <div className="w-px h-6 bg-white/20 mx-1" />
      
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-red-500/20 hover:text-red-400"
        onClick={handleDelete}
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </motion.div>
  );
};