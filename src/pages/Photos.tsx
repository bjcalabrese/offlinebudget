import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout/Layout';
import { PhotoGrid } from '@/components/PhotoGrid/PhotoGrid';
import { PhotoViewer } from '@/components/PhotoViewer/PhotoViewer';
import { UploadModal } from '@/components/Upload/UploadModal';
import { usePhotoStore } from '@/store/photoStore';
import { Photo } from '@/types/photo';

// Generate colored placeholder images for demo
const generatePlaceholder = (color: string, text: string) => {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="300" fill="${color}"/>
      <text x="150" y="150" font-family="Arial" font-size="16" fill="white" text-anchor="middle" alignment-baseline="middle">${text}</text>
    </svg>
  `)}`;
};

// Mock data for demonstration - in a real app, this would come from IndexedDB
const mockPhotos: Photo[] = [
  {
    id: '1',
    filename: 'sunset-beach.jpg',
    url: generatePlaceholder('#FF6B6B', 'Sunset Beach'),
    thumbnailUrl: generatePlaceholder('#FF6B6B', 'Sunset Beach'),
    size: 2048000,
    dimensions: { width: 4000, height: 3000 },
    createdAt: new Date('2024-01-15'),
    uploadedAt: new Date('2024-01-15'),
    takenAt: new Date('2024-01-15'),
    tags: ['sunset', 'beach', 'nature'],
    albumIds: [],
    metadata: {
      exif: {
        make: 'Canon',
        model: 'EOS R5',
        fNumber: 8,
        exposureTime: 1/125,
        iso: 100
      },
      location: {
        latitude: 34.0522,
        longitude: -118.2437
      }
    },
    isFavorite: true
  },
  {
    id: '2',
    filename: 'mountain-lake.jpg',
    url: generatePlaceholder('#4ECDC4', 'Mountain Lake'),
    thumbnailUrl: generatePlaceholder('#4ECDC4', 'Mountain Lake'),
    size: 1856000,
    dimensions: { width: 3840, height: 2560 },
    createdAt: new Date('2024-01-14'),
    uploadedAt: new Date('2024-01-14'),
    takenAt: new Date('2024-01-14'),
    tags: ['mountain', 'lake', 'landscape'],
    albumIds: [],
    metadata: {
      exif: {
        make: 'Sony',
        model: 'A7R IV'
      }
    },
    isFavorite: false
  },
  {
    id: '3',
    filename: 'city-night.jpg',
    url: generatePlaceholder('#45B7D1', 'City Night'),
    thumbnailUrl: generatePlaceholder('#45B7D1', 'City Night'),
    size: 2240000,
    dimensions: { width: 4200, height: 2800 },
    createdAt: new Date('2024-01-13'),
    uploadedAt: new Date('2024-01-13'),
    takenAt: new Date('2024-01-13'),
    tags: ['city', 'night', 'urban'],
    albumIds: [],
    metadata: {
      exif: {
        make: 'Nikon',
        model: 'D850'
      }
    },
    isFavorite: false
  },
  {
    id: '4',
    filename: 'forest-path.jpg',
    url: generatePlaceholder('#96CEB4', 'Forest Path'),
    thumbnailUrl: generatePlaceholder('#96CEB4', 'Forest Path'),
    size: 1920000,
    dimensions: { width: 3600, height: 2400 },
    createdAt: new Date('2024-01-12'),
    uploadedAt: new Date('2024-01-12'),
    takenAt: new Date('2024-01-12'),
    tags: ['forest', 'path', 'nature'],
    albumIds: [],
    metadata: {},
    isFavorite: true
  },
  {
    id: '5',
    filename: 'ocean-waves.jpg',
    url: generatePlaceholder('#74B9FF', 'Ocean Waves'),
    thumbnailUrl: generatePlaceholder('#74B9FF', 'Ocean Waves'),
    size: 2304000,
    dimensions: { width: 4000, height: 3000 },
    createdAt: new Date('2024-01-11'),
    uploadedAt: new Date('2024-01-11'),
    takenAt: new('2024-01-11'),
    tags: ['ocean', 'waves', 'water'],
    albumIds: [],
    metadata: {},
    isFavorite: false
  },
  {
    id: '6',
    filename: 'desert-dunes.jpg',
    url: generatePlaceholder('#FDCB6E', 'Desert Dunes'),
    thumbnailUrl: generatePlaceholder('#FDCB6E', 'Desert Dunes'),
    size: 2112000,
    dimensions: { width: 3800, height: 2533 },
    createdAt: new Date('2024-01-10'),
    uploadedAt: new Date('2024-01-10'),
    takenAt: new Date('2024-01-10'),
    tags: ['desert', 'sand', 'landscape'],
    albumIds: [],
    metadata: {},
    isFavorite: false
  }
];

export const Photos: React.FC = () => {
  const { photos, loadPhotos, addPhotos, setPhotos, filter, loading } = usePhotoStore();

  // Initialize and load photos from IndexedDB
  useEffect(() => {
    const initializePhotos = async () => {
      await loadPhotos();
      // If no photos exist, seed with mock data
      if (photos.length === 0) {
        await addPhotos(mockPhotos);
      }
    };
    
    initializePhotos();
  }, [loadPhotos, addPhotos]);

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
