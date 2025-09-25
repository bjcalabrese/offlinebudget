import React, { useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { usePhotoStore } from '@/store/photoStore';
import { useUIStore } from '@/store/uiStore';
import { PhotoCard } from './PhotoCard';
import { Photo } from '@/types/photo';
import { cn } from '@/lib/utils';

interface PhotoGridProps {
  photos: Photo[];
  className?: string;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, className }) => {
  const { gridSize, selectedPhotos, setSelectedPhoto } = usePhotoStore();
  const { isSelectionMode, openPhotoViewer } = useUIStore();

  // Calculate grid dimensions based on grid size
  const gridDimensions = useMemo(() => {
    switch (gridSize) {
      case 'small':
        return { itemSize: 150, gap: 8 };
      case 'large':
        return { itemSize: 300, gap: 16 };
      default: // medium
        return { itemSize: 200, gap: 12 };
    }
  }, [gridSize]);

  const handlePhotoClick = useCallback((photo: Photo) => {
    if (isSelectionMode) {
      // Handle selection in selection mode
      return;
    }
    
    setSelectedPhoto(photo);
    openPhotoViewer();
  }, [isSelectionMode, setSelectedPhoto, openPhotoViewer]);

  // Calculate columns based on container width
  const getColumnCount = useCallback((width: number) => {
    const minColumns = 2;
    const maxColumns = 8;
    const columns = Math.floor((width - 32) / (gridDimensions.itemSize + gridDimensions.gap));
    return Math.max(minColumns, Math.min(maxColumns, columns));
  }, [gridDimensions]);

  // Grid cell renderer
  const Cell = useCallback(({ columnIndex, rowIndex, style, data }: any) => {
    const { photos, columnCount, itemSize, gap } = data;
    const index = rowIndex * columnCount + columnIndex;
    
    if (index >= photos.length) return null;
    
    const photo = photos[index];
    const isSelected = selectedPhotos.has(photo.id);

    return (
      <div 
        style={{
          ...style,
          left: style.left + gap / 2,
          top: style.top + gap / 2,
          width: itemSize,
          height: itemSize,
        }}
      >
        <PhotoCard
          photo={photo}
          isSelected={isSelected}
          isSelectionMode={isSelectionMode}
          onClick={() => handlePhotoClick(photo)}
          className="w-full h-full"
        />
      </div>
    );
  }, [selectedPhotos, isSelectionMode, handlePhotoClick]);

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <span className="text-4xl">📷</span>
          </div>
          <h3 className="text-lg font-medium mb-2">No photos yet</h3>
          <p className="text-sm">Upload some photos to get started</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn("h-full w-full", className)}>
      <AutoSizer>
        {({ height, width }) => {
          const columnCount = getColumnCount(width);
          const rowCount = Math.ceil(photos.length / columnCount);
          const { itemSize, gap } = gridDimensions;

          return (
            <Grid
              columnCount={columnCount}
              columnWidth={itemSize + gap}
              height={height}
              rowCount={rowCount}
              rowHeight={itemSize + gap}
              width={width}
              itemData={{
                photos,
                columnCount,
                itemSize,
                gap
              }}
            >
              {Cell}
            </Grid>
          );
        }}
      </AutoSizer>
    </div>
  );
};