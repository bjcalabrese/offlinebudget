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

  // Calculate grid dimensions based on grid size with responsive breakpoints
  const gridDimensions = useMemo(() => {
    switch (gridSize) {
      case 'small':
        return { 
          itemSize: 150, 
          gap: 8,
          minColumns: 3,
          maxColumns: 12
        };
      case 'large':
        return { 
          itemSize: 300, 
          gap: 16,
          minColumns: 1,
          maxColumns: 6
        };
      default: // medium
        return { 
          itemSize: 200, 
          gap: 12,
          minColumns: 2,
          maxColumns: 8
        };
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

  // Calculate columns based on container width with responsive breakpoints
  const getColumnCount = useCallback((width: number) => {
    const { itemSize, gap, minColumns, maxColumns } = gridDimensions;
    
    // Responsive breakpoint calculations
    let targetColumns;
    if (width < 640) { // sm breakpoint
      targetColumns = minColumns;
    } else if (width < 768) { // md breakpoint
      targetColumns = Math.min(minColumns + 1, maxColumns);
    } else if (width < 1024) { // lg breakpoint
      targetColumns = Math.min(minColumns + 2, maxColumns);
    } else if (width < 1280) { // xl breakpoint
      targetColumns = Math.min(minColumns + 3, maxColumns);
    } else { // 2xl breakpoint
      targetColumns = maxColumns;
    }
    
    // Calculate optimal columns based on available space
    const availableColumns = Math.floor((width - 32) / (itemSize + gap));
    
    // Use the smaller of target responsive columns or available space
    return Math.max(minColumns, Math.min(targetColumns, availableColumns));
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