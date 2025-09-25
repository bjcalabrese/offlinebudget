import React from 'react';
import { motion } from 'framer-motion';
import { Photo } from '@/types/photo';
import { 
  Calendar,
  Image,
  MapPin,
  Tag,
  Camera,
  Aperture,
  Timer,
  Zap,
  Settings,
  FileImage
} from 'lucide-react';
import { format } from 'date-fns';

interface PhotoInfoProps {
  photo: Photo;
}

export const PhotoInfo: React.FC<PhotoInfoProps> = ({ photo }) => {
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="absolute top-0 right-0 h-full w-80 bg-black/80 backdrop-blur-md text-white p-6 overflow-y-auto"
    >
      <div className="space-y-6">
        {/* File Info */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <FileImage className="h-5 w-5 mr-2" />
            File Information
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Name:</span>
              <span className="text-right">{photo.filename}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Size:</span>
              <span>{formatFileSize(photo.size)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Dimensions:</span>
              <span>{photo.dimensions.width} × {photo.dimensions.height}</span>
            </div>
          </div>
        </div>

        {/* Date Info */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Dates
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Created:</span>
              <span>{format(new Date(photo.createdAt), 'MMM d, yyyy HH:mm')}</span>
            </div>
            {photo.takenAt && (
              <div className="flex justify-between">
                <span className="text-gray-300">Taken:</span>
                <span>{format(new Date(photo.takenAt), 'MMM d, yyyy HH:mm')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        {photo.location && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Location
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Latitude:</span>
                <span>{photo.location.latitude.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Longitude:</span>
                <span>{photo.location.longitude.toFixed(6)}</span>
              </div>
            </div>
          </div>
        )}

        {/* EXIF Data */}
        {photo.exif && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              Camera Settings
            </h3>
            <div className="space-y-2 text-sm">
              {photo.exif.make && (
                <div className="flex justify-between">
                  <span className="text-gray-300">Camera:</span>
                  <span className="text-right">{photo.exif.make} {photo.exif.model}</span>
                </div>
              )}
              
              {photo.exif.fNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-300 flex items-center">
                    <Aperture className="h-3 w-3 mr-1" />
                    Aperture:
                  </span>
                  <span>f/{photo.exif.fNumber}</span>
                </div>
              )}
              
              {photo.exif.exposureTime && (
                <div className="flex justify-between">
                  <span className="text-gray-300 flex items-center">
                    <Timer className="h-3 w-3 mr-1" />
                    Shutter:
                  </span>
                  <span>1/{Math.round(1 / photo.exif.exposureTime)}s</span>
                </div>
              )}
              
              {photo.exif.iso && (
                <div className="flex justify-between">
                  <span className="text-gray-300 flex items-center">
                    <Zap className="h-3 w-3 mr-1" />
                    ISO:
                  </span>
                  <span>{photo.exif.iso}</span>
                </div>
              )}
              
              {photo.exif.focalLength && (
                <div className="flex justify-between">
                  <span className="text-gray-300">Focal Length:</span>
                  <span>{photo.exif.focalLength}mm</span>
                </div>
              )}
              
              {photo.exif.flash !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-300">Flash:</span>
                  <span>{photo.exif.flash ? 'Yes' : 'No'}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {photo.tags.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {photo.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-white/20 px-2 py-1 rounded-full text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Favorite Status */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Status
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Favorite:</span>
              <span>{photo.isFavorite ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Albums:</span>
              <span>{photo.albumIds.length || 'None'}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};