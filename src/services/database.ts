import { Photo, UploadRecord, StorageInfo } from '@/types/photo';
import { Album } from '@/types/album';
import { AppSettings, Tag, SavedSearch } from '@/types/settings';

const DB_NAME = 'PhotosApp';
const DB_VERSION = 1;

export class PhotoDatabase {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createStores(db);
      };
    });
  }

  private createStores(db: IDBDatabase): void {
    // Photos store
    if (!db.objectStoreNames.contains('photos')) {
      const photosStore = db.createObjectStore('photos', { keyPath: 'id' });
      photosStore.createIndex('filename', 'filename', { unique: false });
      photosStore.createIndex('uploadedAt', 'uploadedAt', { unique: false });
      photosStore.createIndex('albumIds', 'albumIds', { unique: false, multiEntry: true });
      photosStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
      photosStore.createIndex('isFavorite', 'isFavorite', { unique: false });
    }

    // Albums store
    if (!db.objectStoreNames.contains('albums')) {
      const albumsStore = db.createObjectStore('albums', { keyPath: 'id' });
      albumsStore.createIndex('name', 'name', { unique: false });
      albumsStore.createIndex('createdAt', 'createdAt', { unique: false });
      albumsStore.createIndex('isSmartAlbum', 'isSmartAlbum', { unique: false });
    }

    // Thumbnails store
    if (!db.objectStoreNames.contains('thumbnails')) {
      const thumbnailsStore = db.createObjectStore('thumbnails', { keyPath: 'id' });
      thumbnailsStore.createIndex('photoId', 'photoId', { unique: false });
      thumbnailsStore.createIndex('size', 'size', { unique: false });
    }

    // Tags store
    if (!db.objectStoreNames.contains('tags')) {
      const tagsStore = db.createObjectStore('tags', { keyPath: 'id' });
      tagsStore.createIndex('name', 'name', { unique: true });
      tagsStore.createIndex('photoCount', 'photoCount', { unique: false });
    }

    // Settings store
    if (!db.objectStoreNames.contains('settings')) {
      db.createObjectStore('settings', { keyPath: 'key' });
    }

    // Upload history store
    if (!db.objectStoreNames.contains('uploadHistory')) {
      const uploadStore = db.createObjectStore('uploadHistory', { keyPath: 'id' });
      uploadStore.createIndex('uploadedAt', 'uploadedAt', { unique: false });
      uploadStore.createIndex('status', 'status', { unique: false });
    }

    // Saved searches store
    if (!db.objectStoreNames.contains('savedSearches')) {
      const searchStore = db.createObjectStore('savedSearches', { keyPath: 'id' });
      searchStore.createIndex('name', 'name', { unique: false });
      searchStore.createIndex('lastUsed', 'lastUsed', { unique: false });
    }
  }

  // Photo operations
  async addPhoto(photo: Photo): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['photos'], 'readwrite');
    const store = transaction.objectStore('photos');
    
    return new Promise((resolve, reject) => {
      const request = store.add(photo);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async addPhotos(photos: Photo[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['photos'], 'readwrite');
    const store = transaction.objectStore('photos');
    
    return new Promise((resolve, reject) => {
      let completed = 0;
      const total = photos.length;
      
      photos.forEach(photo => {
        const request = store.add(photo);
        request.onsuccess = () => {
          completed++;
          if (completed === total) resolve();
        };
        request.onerror = () => reject(request.error);
      });
      
      // Handle empty array
      if (total === 0) resolve();
    });
  }

  async getPhoto(id: string): Promise<Photo | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['photos'], 'readonly');
    const store = transaction.objectStore('photos');
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllPhotos(): Promise<Photo[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['photos'], 'readonly');
    const store = transaction.objectStore('photos');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updatePhoto(id: string, updates: Partial<Photo>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['photos'], 'readwrite');
    const store = transaction.objectStore('photos');
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const photo = getRequest.result;
        if (photo) {
          const updatedPhoto = { ...photo, ...updates };
          const putRequest = store.put(updatedPhoto);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Photo not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deletePhoto(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['photos', 'thumbnails'], 'readwrite');
    const photosStore = transaction.objectStore('photos');
    const thumbnailsStore = transaction.objectStore('thumbnails');
    
    return new Promise((resolve, reject) => {
      // Delete photo
      const deletePhotoRequest = photosStore.delete(id);
      
      // Delete associated thumbnails
      const thumbnailIndex = thumbnailsStore.index('photoId');
      const thumbnailRequest = thumbnailIndex.openCursor(IDBKeyRange.only(id));
      
      thumbnailRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Album operations
  async addAlbum(album: Album): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['albums'], 'readwrite');
    const store = transaction.objectStore('albums');
    
    return new Promise((resolve, reject) => {
      const request = store.add(album);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllAlbums(): Promise<Album[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['albums'], 'readonly');
    const store = transaction.objectStore('albums');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateAlbum(id: string, updates: Partial<Album>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['albums'], 'readwrite');
    const store = transaction.objectStore('albums');
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const album = getRequest.result;
        if (album) {
          const updatedAlbum = { ...album, ...updates };
          const putRequest = store.put(updatedAlbum);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Album not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteAlbum(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['albums'], 'readwrite');
    const store = transaction.objectStore('albums');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Thumbnail operations
  async addThumbnail(photoId: string, size: 'small' | 'medium' | 'large', blob: Blob): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['thumbnails'], 'readwrite');
    const store = transaction.objectStore('thumbnails');
    
    const thumbnail = {
      id: `${photoId}_${size}`,
      photoId,
      size,
      blob
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(thumbnail);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getThumbnail(photoId: string, size: 'small' | 'medium' | 'large'): Promise<Blob | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['thumbnails'], 'readonly');
    const store = transaction.objectStore('thumbnails');
    
    return new Promise((resolve, reject) => {
      const request = store.get(`${photoId}_${size}`);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.blob : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Settings operations
  async getSetting(key: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async setSetting(key: string, value: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    
    return new Promise((resolve, reject) => {
      const request = store.put({ key, value });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Storage info
  async getStorageInfo(): Promise<StorageInfo> {
    if (!this.db) throw new Error('Database not initialized');
    
    const [photos, thumbnails] = await Promise.all([
      this.getAllPhotos(),
      this.getAllThumbnails()
    ]);
    
    const totalPhotoSize = photos.reduce((sum, photo) => sum + photo.size, 0);
    const totalThumbnailSize = thumbnails.reduce((sum, thumb) => sum + thumb.blob.size, 0);
    
    // Estimate available space (not perfectly accurate but gives an idea)
    let availableSpace: number | undefined;
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        availableSpace = estimate.quota ? estimate.quota - (estimate.usage || 0) : undefined;
      } catch (e) {
        // Ignore errors
      }
    }
    
    return {
      totalSize: totalPhotoSize,
      photoCount: photos.length,
      thumbnailSize: totalThumbnailSize,
      metadataSize: 0, // TODO: Calculate metadata size
      availableSpace
    };
  }

  private async getAllThumbnails(): Promise<{ blob: Blob }[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['thumbnails'], 'readonly');
    const store = transaction.objectStore('thumbnails');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Tag operations
  async addTag(tag: Tag): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['tags'], 'readwrite');
    const store = transaction.objectStore('tags');
    
    return new Promise((resolve, reject) => {
      const request = store.put(tag);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllTags(): Promise<Tag[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = this.db.transaction(['tags'], 'readonly');
    const store = transaction.objectStore('tags');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Search operations
  async searchPhotos(query: string, limit: number = 50): Promise<Photo[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const photos = await this.getAllPhotos();
    const searchTerms = query.toLowerCase().split(' ');
    
    return photos
      .filter(photo => {
        const searchableText = [
          photo.filename,
          ...photo.tags,
          photo.metadata.description || '',
          ...(photo.metadata.keywords || [])
        ].join(' ').toLowerCase();
        
        return searchTerms.every(term => searchableText.includes(term));
      })
      .slice(0, limit);
  }

  // Cleanup operations
  async cleanup(): Promise<void> {
    // Implementation for cleaning up old thumbnails, unused data, etc.
    // This would be called periodically based on settings
  }
}

// Singleton instance
export const photoDatabase = new PhotoDatabase();