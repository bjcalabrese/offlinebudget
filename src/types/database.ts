import { Photo, UploadRecord, StorageInfo } from './photo';
import { Album } from './album';
import { AppSettings, Tag, SavedSearch } from './settings';

export interface PhotoDatabase {
  photos: Photo[];
  albums: Album[];
  tags: Tag[];
  settings: AppSettings;
  uploadHistory: UploadRecord[];
  savedSearches: SavedSearch[];
}

export interface DatabaseSchema {
  photos: {
    key: string;
    value: Photo;
    indexes: {
      filename: string;
      uploadedAt: Date;
      albumIds: string[];
      tags: string[];
      isFavorite: boolean;
    };
  };
  albums: {
    key: string;
    value: Album;
    indexes: {
      name: string;
      createdAt: Date;
      isSmartAlbum: boolean;
    };
  };
  thumbnails: {
    key: string;
    value: {
      photoId: string;
      size: 'small' | 'medium' | 'large';
      blob: Blob;
    };
    indexes: {
      photoId: string;
      size: string;
    };
  };
  metadata: {
    key: string;
    value: {
      photoId: string;
      exif?: any;
      location?: any;
      keywords?: string[];
      description?: string;
      rating?: number;
    };
    indexes: {
      photoId: string;
    };
  };
  tags: {
    key: string;
    value: Tag;
    indexes: {
      name: string;
      photoCount: number;
    };
  };
  settings: {
    key: string;
    value: any;
  };
  uploadHistory: {
    key: string;
    value: UploadRecord;
    indexes: {
      uploadedAt: Date;
      status: string;
    };
  };
  savedSearches: {
    key: string;
    value: SavedSearch;
    indexes: {
      name: string;
      lastUsed: Date;
    };
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FileManager {
  generateThumbnails(file: File): Promise<{
    small: Blob;
    medium: Blob;
    large: Blob;
  }>;
  compressImage(file: File, quality: number): Promise<Blob>;
  extractMetadata(file: File): Promise<{
    exif?: any;
    location?: any;
    dimensions: { width: number; height: number };
  }>;
  validateFile(file: File): ValidationResult;
  estimateStorageUsage(): Promise<StorageInfo>;
}