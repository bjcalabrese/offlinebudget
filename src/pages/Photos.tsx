import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout/Layout';
import { PhotoGrid } from '@/components/PhotoGrid/PhotoGrid';
import { PhotoViewer } from '@/components/PhotoViewer/PhotoViewer';
import { UploadModal } from '@/components/Upload/UploadModal';
import { usePhotoStore } from '@/store/photoStore';
import { Photo } from '@/types/photo';

// Mock data for demonstration - in a real app, this would come from an API
const mockPhotos: Photo[] = [
  {
    id: '1',
    filename: 'sunset-beach.jpg',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
    size: 2048000,
    dimensions: { width: 4000, height: 3000 },
    createdAt: new Date('2024-01-15'),
    takenAt: new Date('2024-01-15'),
    tags: ['sunset', 'beach', 'nature'],
    albumIds: [],
    isFavorite: true
  },
  {
    id: '2',
    filename: 'mountain-lake.jpg',
    url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=300',
    size: 1856000,
    dimensions: { width: 3840, height: 2560 },
    createdAt: new Date('2024-01-14'),
    takenAt: new Date('2024-01-14'),
    tags: ['mountain', 'lake', 'landscape'],
    albumIds: [],
    isFavorite: false
  },
  {
    id: '3',
    filename: 'city-night.jpg',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=300',
    size: 2240000,
    dimensions: { width: 4200, height: 2800 },
    createdAt: new Date('2024-01-13'),
    takenAt: new Date('2024-01-13'),
    tags: ['city', 'night', 'urban'],
    albumIds: [],
    isFavorite: false
  },
  {
    id: '4',
    filename: 'forest-path.jpg',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300',
    size: 1920000,
    dimensions: { width: 3600, height: 2400 },
    createdAt: new Date('2024-01-12'),
    takenAt: new Date('2024-01-12'),
    tags: ['forest', 'path', 'nature'],
    albumIds: [],
    isFavorite: true
  },
  {
    id: '5',
    filename: 'ocean-waves.jpg',
    url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=300',
    size: 2304000,
    dimensions: { width: 4000, height: 3000 },
    createdAt: new Date('2024-01-11'),
    takenAt: new Date('2024-01-11'),
    tags: ['ocean', 'waves', 'water'],
    albumIds: [],
    isFavorite: false
  },
  {
    id: '6',
    filename: 'desert-dunes.jpg',
    url: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=300',
    size: 2112000,
    dimensions: { width: 3800, height: 2533 },
    createdAt: new Date('2024-01-10'),
    takenAt: new Date('2024-01-10'),
    tags: ['desert', 'sand', 'landscape'],
    albumIds: [],
    isFavorite: false
  }
];

export const Photos: React.FC = () => {
  const { photos, setPhotos, filter, loading } = usePhotoStore();

  // Initialize with mock data
  useEffect(() => {
    setPhotos(mockPhotos);
  }, [setPhotos]);

  // Filter photos based on current filter
  const filteredPhotos = useMemo(() => {
    return photos.filter(photo => {
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        if (!photo.filename.toLowerCase().includes(searchLower) &&
            !photo.tags.some(tag => tag.toLowerCase().includes(searchLower))) {
          return false;
        }
      }

      if (filter.isFavorite !== undefined && photo.isFavorite !== filter.isFavorite) {
        return false;
      }

      if (filter.tags && filter.tags.length > 0) {
        if (!filter.tags.some(tag => photo.tags.includes(tag))) {
          return false;
        }
      }

      if (filter.dateFrom && new Date(photo.createdAt) < filter.dateFrom) {
        return false;
      }

      if (filter.dateTo && new Date(photo.createdAt) > filter.dateTo) {
        return false;
      }

      return true;
    });
  }, [photos, filter]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading photos...</p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-full p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <PhotoGrid photos={filteredPhotos} />
        </motion.div>
      </div>
      <PhotoViewer />
      <UploadModal />
    </Layout>
  );
};