export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ExifData {
  make?: string;
  model?: string;
  dateTime?: string;
  orientation?: number;
  xResolution?: number;
  yResolution?: number;
  resolutionUnit?: number;
  software?: string;
  fNumber?: number;
  exposureTime?: number;
  iso?: number;
  focalLength?: number;
  flash?: boolean;
}

export interface PhotoMetadata {
  exif?: ExifData;
  location?: Coordinates;
  keywords?: string[];
  description?: string;
  rating?: number;
}

export interface Photo {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl: string;
  fileBlob?: Blob; // For local storage
  thumbnailBlob?: Blob;
  size: number;
  dimensions: { 
    width: number; 
    height: number; 
  };
  createdAt: Date;
  uploadedAt: Date;
  takenAt?: Date;
  albumIds: string[];
  tags: string[];
  metadata: PhotoMetadata;
  isFavorite: boolean;
}

export interface PhotoFilter {
  search?: string;
  tags?: string[];
  albumId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  isFavorite?: boolean;
  location?: boolean;
}

export type ViewMode = 'grid' | 'timeline';
export type GridSize = 'small' | 'medium' | 'large';

export interface UploadProgress {
  id: string;
  filename: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface UploadRecord {
  id: string;
  filename: string;
  uploadedAt: Date;
  size: number;
  albumIds: string[];
  status: 'success' | 'failed';
  error?: string;
}

export interface ThumbnailSet {
  small: Blob;   // 150x150
  medium: Blob;  // 300x300  
  large: Blob;   // 600x600
}

export interface StorageInfo {
  totalSize: number;
  photoCount: number;
  thumbnailSize: number;
  metadataSize: number;
  availableSpace?: number;
}