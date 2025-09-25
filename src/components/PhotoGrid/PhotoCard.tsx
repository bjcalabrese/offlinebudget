import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Photo } from '@/types/photo';
import { usePhotoStore } from '@/store/photoStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Heart, 
  Download, 
  Share, 
  MoreHorizontal,
  Star,
  MapPin
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInView } from 'react-intersection-observer';

interface PhotoCardProps {
  photo: Photo;
  isSelected: boolean;
  isSelectionMode: boolean;
  onClick: () => void;
  className?: string;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  isSelected,
  isSelectionMode,
  onClick,
  className
}) => {
  const { togglePhotoSelection, updatePhoto } = usePhotoStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const handleSelectionChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePhotoSelection(photo.id);
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    updatePhoto(photo.id, { isFavorite: !photo.isFavorite });
  };

  const cardVariants = {
    idle: { 
      scale: 1,
      transition: { duration: 0.2 }
    },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    selected: {
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <motion.div
      ref={ref}
      className={cn(
        "photo-grid-item relative cursor-pointer group",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        className
      )}
      variants={cardVariants}
      initial="idle"
      animate={isSelected ? "selected" : isHovered ? "hover" : "idle"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Image */}
      {inView && (
        <motion.img
          src={photo.thumbnailUrl}
          alt={photo.filename}
          className={cn(
            "photo-grid-image",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
      )}

      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* Selection checkbox */}
      {isSelectionMode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-2 left-2 z-10"
        >
          <Checkbox
            checked={isSelected}
            onChange={handleSelectionChange}
            className="bg-background/80 backdrop-blur-sm"
          />
        </motion.div>
      )}

      {/* Hover overlay */}
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        variants={overlayVariants}
        initial="hidden"
        animate={isHovered || isSelectionMode ? "visible" : "hidden"}
      />

      {/* Action buttons */}
      <motion.div
        className="absolute top-2 right-2 flex space-x-1"
        variants={overlayVariants}
        initial="hidden"
        animate={isHovered && !isSelectionMode ? "visible" : "hidden"}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          onClick={handleFavoriteToggle}
        >
          <Heart 
            className={cn(
              "h-4 w-4",
              photo.isFavorite ? "fill-red-500 text-red-500" : "text-foreground"
            )} 
          />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share className="mr-2 h-4 w-4" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Star className="mr-2 h-4 w-4" />
              Add to Album
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* Photo info */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent"
        variants={overlayVariants}
        initial="hidden"
        animate={isHovered && !isSelectionMode ? "visible" : "hidden"}
      >
        <div className="text-white text-xs">
          <div className="font-medium truncate">{photo.filename}</div>
          <div className="flex items-center justify-between mt-1">
            <span>{new Date(photo.createdAt).toLocaleDateString()}</span>
            {photo.location && (
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                <span>Location</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};