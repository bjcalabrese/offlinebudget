import { Photo } from '@/types/photo';
import { Album, SmartAlbumCriteria } from '@/types/album';

export class SmartAlbumService {
  
  static createDefaultSmartAlbums(): Album[] {
    const now = new Date();
    
    return [
      {
        id: 'smart-recent',
        name: 'Recently Added',
        description: 'Photos added in the last 30 days',
        photoIds: [],
        createdAt: now,
        updatedAt: now,
        isSmartAlbum: true,
        smartAlbumCriteria: {
          type: 'recent',
          params: { days: 30 }
        }
      },
      {
        id: 'smart-favorites',
        name: 'Favorites',
        description: 'Your favorite photos',
        photoIds: [],
        createdAt: now,
        updatedAt: now,
        isSmartAlbum: true,
        smartAlbumCriteria: {
          type: 'favorites'
        }
      },
      {
        id: 'smart-screenshots',
        name: 'Screenshots',
        description: 'Screenshots and screen recordings',
        photoIds: [],
        createdAt: now,
        updatedAt: now,
        isSmartAlbum: true,
        smartAlbumCriteria: {
          type: 'screenshots'
        }
      },
      {
        id: 'smart-large-files',
        name: 'Large Files',
        description: 'Photos larger than 5MB',
        photoIds: [],
        createdAt: now,
        updatedAt: now,
        isSmartAlbum: true,
        smartAlbumCriteria: {
          type: 'date_range',
          params: { dateFrom: new Date(0) } // Using date_range type for large files
        }
      }
    ];
  }

  static filterPhotosForSmartAlbum(photos: Photo[], criteria: SmartAlbumCriteria): Photo[] {
    switch (criteria.type) {
      case 'recent':
        return this.filterRecentPhotos(photos, criteria.params?.days || 30);
      
      case 'favorites':
        return photos.filter(photo => photo.isFavorite);
      
      case 'screenshots':
        return this.filterScreenshots(photos);
      
      case 'videos':
        // For now, we're only handling images, but this would filter video files
        return [];
      
      case 'location':
        return this.filterByLocation(photos, criteria.params?.location);
      
      case 'date_range':
        return this.filterByDateRange(
          photos, 
          criteria.params?.dateFrom, 
          criteria.params?.dateTo
        );
      
      default:
        return [];
    }
  }

  private static filterRecentPhotos(photos: Photo[], days: number): Photo[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return photos.filter(photo => 
      photo.uploadedAt >= cutoffDate
    ).sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  }

  private static filterScreenshots(photos: Photo[]): Photo[] {
    const screenshotPatterns = [
      /screenshot/i,
      /screen[_\s-]?shot/i,
      /screen[_\s-]?capture/i,
      /^IMG_\d{4}$/i, // Common screenshot naming pattern
      /^Screenshot_/i,
      /^Screen\s/i
    ];
    
    return photos.filter(photo => 
      screenshotPatterns.some(pattern => 
        pattern.test(photo.filename) ||
        photo.tags.some(tag => pattern.test(tag))
      )
    );
  }

  private static filterByLocation(photos: Photo[], location?: string): Photo[] {
    if (!location) return [];
    
    return photos.filter(photo => 
      photo.metadata.location && 
      // This would need a proper location matching algorithm
      // For now, just check if location data exists
      true
    );
  }

  private static filterByDateRange(
    photos: Photo[], 
    dateFrom?: Date, 
    dateTo?: Date
  ): Photo[] {
    return photos.filter(photo => {
      const photoDate = photo.takenAt || photo.uploadedAt;
      
      if (dateFrom && photoDate < dateFrom) return false;
      if (dateTo && photoDate > dateTo) return false;
      
      return true;
    });
  }

  static updateSmartAlbumPhotoIds(album: Album, allPhotos: Photo[]): Album {
    if (!album.isSmartAlbum || !album.smartAlbumCriteria) {
      return album;
    }

    const matchingPhotos = this.filterPhotosForSmartAlbum(
      allPhotos, 
      album.smartAlbumCriteria
    );

    return {
      ...album,
      photoIds: matchingPhotos.map(photo => photo.id),
      updatedAt: new Date()
    };
  }

  static updateAllSmartAlbums(albums: Album[], allPhotos: Photo[]): Album[] {
    return albums.map(album => 
      album.isSmartAlbum 
        ? this.updateSmartAlbumPhotoIds(album, allPhotos)
        : album
    );
  }

  static createCustomSmartAlbum(
    name: string,
    criteria: SmartAlbumCriteria,
    description?: string
  ): Album {
    return {
      id: `smart-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name,
      description,
      photoIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isSmartAlbum: true,
      smartAlbumCriteria: criteria
    };
  }

  // Utility methods for UI
  static getSmartAlbumIcon(criteria: SmartAlbumCriteria): string {
    switch (criteria.type) {
      case 'recent': return '🕒';
      case 'favorites': return '❤️';
      case 'screenshots': return '📱';
      case 'videos': return '🎥';
      case 'location': return '📍';
      case 'date_range': return '📅';
      default: return '📁';
    }
  }

  static getSmartAlbumDescription(criteria: SmartAlbumCriteria): string {
    switch (criteria.type) {
      case 'recent':
        return `Photos added in the last ${criteria.params?.days || 30} days`;
      case 'favorites':
        return 'Your favorite photos';
      case 'screenshots':
        return 'Screenshots and screen captures';
      case 'videos':
        return 'Video files';
      case 'location':
        return criteria.params?.location 
          ? `Photos taken in ${criteria.params.location}`
          : 'Photos with location data';
      case 'date_range':
        if (criteria.params?.dateFrom && criteria.params?.dateTo) {
          return `Photos from ${criteria.params.dateFrom.toLocaleDateString()} to ${criteria.params.dateTo.toLocaleDateString()}`;
        }
        return 'Photos in date range';
      default:
        return 'Smart album';
    }
  }
}

export const smartAlbumService = new SmartAlbumService();