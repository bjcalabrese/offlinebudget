import { PhotoFilter } from './photo';

export interface AppSettings {
  display: {
    theme: 'light' | 'dark' | 'auto';
    gridDensity: 'comfortable' | 'cozy' | 'compact';
    thumbnailQuality: 'low' | 'medium' | 'high';
    animationSpeed: number;
    language: string;
    highContrast: boolean;
    reducedMotion: boolean;
  };
  storage: {
    maxCacheSize: number; // MB
    autoCleanup: boolean;
    compressionLevel: number;
    backgroundSync: boolean;
    memoryUsageLimit: number; // MB
  };
  upload: {
    defaultAlbum?: string;
    autoCreateByDate: boolean;
    autoCreateByLocation: boolean;
    compressionQuality: number;
    generateMultipleSizes: boolean;
    autoTagByFilename: boolean;
    duplicateDetection: boolean;
  };
  privacy: {
    stripMetadata: boolean;
    keepLocationData: boolean;
    enableAnalytics: boolean;
  };
  search: {
    searchHistoryLength: number;
    enableAutoTagging: boolean;
    dateFormat: string;
    sortOrderDefault: 'newest' | 'oldest' | 'name';
  };
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  photoCount: number;
  createdAt: Date;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: PhotoFilter;
  createdAt: Date;
  lastUsed: Date;
}