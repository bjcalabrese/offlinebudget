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

export interface Photo {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl: string;
  size: number;
  dimensions: { 
    width: number; 
    height: number; 
  };
  createdAt: Date;
  takenAt?: Date;
  location?: Coordinates;
  exif?: ExifData;
  tags: string[];
  albumIds: string[];
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