export interface Album {
  id: string;
  name: string;
  description?: string;
  coverPhotoId?: string;
  photoIds: string[];
  createdAt: Date;
  updatedAt: Date;
  isSmartAlbum: boolean;
  smartAlbumCriteria?: SmartAlbumCriteria;
}

export interface SmartAlbumCriteria {
  type: 'recent' | 'favorites' | 'screenshots' | 'videos' | 'location' | 'date_range';
  params?: {
    days?: number;
    location?: string;
    dateFrom?: Date;
    dateTo?: Date;
  };
}

export type AlbumSortBy = 'name' | 'created_at' | 'updated_at' | 'photo_count';
export type SortDirection = 'asc' | 'desc';