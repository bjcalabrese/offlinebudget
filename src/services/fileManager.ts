import { ValidationResult, StorageInfo, ThumbnailSet } from '@/types/photo';
import { photoDatabase } from './database';

export class FileManagerService {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  async generateThumbnails(file: File): Promise<ThumbnailSet> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const small = await this.createThumbnail(img, 150, 150);
          const medium = await this.createThumbnail(img, 300, 300);
          const large = await this.createThumbnail(img, 600, 600);
          
          resolve({ small, medium, large });
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  private async createThumbnail(img: HTMLImageElement, maxWidth: number, maxHeight: number): Promise<Blob> {
    const { width, height } = this.calculateDimensions(img.width, img.height, maxWidth, maxHeight);
    
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Clear canvas and draw image
    this.ctx.clearRect(0, 0, width, height);
    this.ctx.drawImage(img, 0, 0, width, height);
    
    return new Promise((resolve, reject) => {
      this.canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create thumbnail'));
          }
        },
        'image/jpeg',
        0.8
      );
    });
  }

  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };
    
    // Calculate scaling ratio
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    
    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }
    
    return { width: Math.round(width), height: Math.round(height) };
  }

  async compressImage(file: File, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        
        this.ctx.drawImage(img, 0, 0);
        
        this.canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality / 100
        );
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = URL.createObjectURL(file);
    });
  }

  async extractMetadata(file: File): Promise<{
    exif?: any;
    location?: any;
    dimensions: { width: number; height: number };
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const dimensions = {
          width: img.width,
          height: img.height
        };
        
        // For now, return basic metadata
        // In a real app, you'd use a library like exif-js or piexifjs
        resolve({
          dimensions,
          exif: {
            // Basic EXIF data would go here
            dateTime: file.lastModified ? new Date(file.lastModified).toISOString() : undefined,
            software: 'PhotosApp'
          }
        });
      };
      img.onerror = () => reject(new Error('Failed to load image for metadata extraction'));
      img.src = URL.createObjectURL(file);
    });
  }

  validateFile(file: File): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check file type
    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!supportedTypes.includes(file.type)) {
      errors.push(`Unsupported file type: ${file.type}`);
    }
    
    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      errors.push(`File too large: ${Math.round(file.size / 1024 / 1024)}MB (max 50MB)`);
    }
    
    // Warning for large files
    const warningSize = 10 * 1024 * 1024; // 10MB
    if (file.size > warningSize && file.size <= maxSize) {
      warnings.push(`Large file: ${Math.round(file.size / 1024 / 1024)}MB`);
    }
    
    // Check filename
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(file.name)) {
      warnings.push('Filename contains special characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  async estimateStorageUsage(): Promise<StorageInfo> {
    return await photoDatabase.getStorageInfo();
  }

  // Utility function to convert blob to data URL
  async blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  // Utility function to detect duplicates based on hash
  async generateFileHash(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Memory cleanup
  cleanup(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Reset canvas size to minimize memory usage
    this.canvas.width = 1;
    this.canvas.height = 1;
  }
}

// Singleton instance
export const fileManager = new FileManagerService();