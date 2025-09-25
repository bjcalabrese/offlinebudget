import React from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { useAlbumStore } from '@/store/albumStore';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Upload, Folder, Calendar, MapPin, Hash, Copy } from 'lucide-react';

export const UploadSettings: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const { albums } = useAlbumStore();

  const handleDefaultAlbumChange = (albumId: string) => {
    updateSettings({ 
      upload: { 
        ...settings.upload, 
        defaultAlbum: albumId === 'none' ? undefined : albumId 
      } 
    });
  };

  const handleAutoCreateByDateChange = (autoCreateByDate: boolean) => {
    updateSettings({ upload: { ...settings.upload, autoCreateByDate } });
  };

  const handleAutoCreateByLocationChange = (autoCreateByLocation: boolean) => {
    updateSettings({ upload: { ...settings.upload, autoCreateByLocation } });
  };

  const handleCompressionQualityChange = (value: number[]) => {
    updateSettings({ upload: { ...settings.upload, compressionQuality: value[0] } });
  };

  const handleGenerateMultipleSizesChange = (generateMultipleSizes: boolean) => {
    updateSettings({ upload: { ...settings.upload, generateMultipleSizes } });
  };

  const handleAutoTagByFilenameChange = (autoTagByFilename: boolean) => {
    updateSettings({ upload: { ...settings.upload, autoTagByFilename } });
  };

  const handleDuplicateDetectionChange = (duplicateDetection: boolean) => {
    updateSettings({ upload: { ...settings.upload, duplicateDetection } });
  };

  const regularAlbums = albums.filter(album => !album.isSmartAlbum);

  return (
    <div className="space-y-6">
      {/* Default Album */}
      <div className="space-y-2">
        <Label htmlFor="default-album" className="flex items-center">
          <Folder className="h-4 w-4 mr-2" />
          Default Album for New Uploads
        </Label>
        <Select 
          value={settings.upload.defaultAlbum || 'none'} 
          onValueChange={handleDefaultAlbumChange}
        >
          <SelectTrigger id="default-album">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No default album</SelectItem>
            {regularAlbums.map(album => (
              <SelectItem key={album.id} value={album.id}>
                {album.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          All new uploads will be automatically added to this album
        </p>
      </div>

      <Separator />

      {/* Auto-creation Rules */}
      <div className="space-y-4">
        <Label className="text-base font-medium flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          Auto-creation Rules
        </Label>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-date" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Auto-create Albums by Date
            </Label>
            <p className="text-sm text-muted-foreground">
              Automatically create monthly albums (e.g., "January 2024")
            </p>
          </div>
          <Switch
            id="auto-date"
            checked={settings.upload.autoCreateByDate}
            onCheckedChange={handleAutoCreateByDateChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-location" className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Auto-create Albums by Location
            </Label>
            <p className="text-sm text-muted-foreground">
              Create albums based on photo location data (when available)
            </p>
          </div>
          <Switch
            id="auto-location"
            checked={settings.upload.autoCreateByLocation}
            onCheckedChange={handleAutoCreateByLocationChange}
          />
        </div>
      </div>

      <Separator />

      {/* Image Processing */}
      <div className="space-y-4">
        <Label className="text-base font-medium flex items-center">
          <Upload className="h-4 w-4 mr-2" />
          Image Processing
        </Label>

        <div className="space-y-3">
          <Label htmlFor="compression-quality">Image Compression Quality</Label>
          <div className="px-3">
            <Slider
              id="compression-quality"
              min={10}
              max={100}
              step={5}
              value={[settings.upload.compressionQuality]}
              onValueChange={handleCompressionQualityChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Smaller File</span>
              <span>Better Quality</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Current quality: {settings.upload.compressionQuality}%
            </p>
            <Badge variant={
              settings.upload.compressionQuality < 50 ? "destructive" :
              settings.upload.compressionQuality < 80 ? "default" : "secondary"
            }>
              {settings.upload.compressionQuality < 50 ? 'High compression' :
               settings.upload.compressionQuality < 80 ? 'Balanced' : 'Best quality'}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="multiple-sizes">Generate Multiple Thumbnail Sizes</Label>
            <p className="text-sm text-muted-foreground">
              Create small, medium, and large thumbnails for better performance
            </p>
          </div>
          <Switch
            id="multiple-sizes"
            checked={settings.upload.generateMultipleSizes}
            onCheckedChange={handleGenerateMultipleSizesChange}
          />
        </div>
      </div>

      <Separator />

      {/* Auto-tagging */}
      <div className="space-y-4">
        <Label className="text-base font-medium flex items-center">
          <Hash className="h-4 w-4 mr-2" />
          Auto-tagging
        </Label>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-tag-filename">Auto-tag Based on Filename</Label>
            <p className="text-sm text-muted-foreground">
              Extract tags from photo filenames (e.g., "vacation_beach_2024.jpg" → vacation, beach, 2024)
            </p>
          </div>
          <Switch
            id="auto-tag-filename"
            checked={settings.upload.autoTagByFilename}
            onCheckedChange={handleAutoTagByFilenameChange}
          />
        </div>

        {settings.upload.autoTagByFilename && (
          <div className="ml-6 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-2">Auto-tagging Examples:</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div>• "IMG_beach_sunset_2024.jpg" → beach, sunset, 2024</div>
              <div>• "family-vacation-italy.jpg" → family, vacation, italy</div>
              <div>• "concert_NYC_weekend.jpg" → concert, NYC, weekend</div>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Duplicate Detection */}
      <div className="space-y-4">
        <Label className="text-base font-medium flex items-center">
          <Copy className="h-4 w-4 mr-2" />
          Duplicate Detection
        </Label>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="duplicate-detection">Detect Duplicate Photos</Label>
            <p className="text-sm text-muted-foreground">
              Warn when uploading photos that might already exist in your library
            </p>
          </div>
          <Switch
            id="duplicate-detection"
            checked={settings.upload.duplicateDetection}
            onCheckedChange={handleDuplicateDetectionChange}
          />
        </div>

        {settings.upload.duplicateDetection && (
          <div className="ml-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Duplicate detection compares file size, name, and content hash 
              to identify potential duplicates. This may slow down the upload process slightly.
            </p>
          </div>
        )}
      </div>

      {/* Upload Performance Tips */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-2">💡 Upload Performance Tips</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Lower compression quality = faster uploads, smaller files</li>
          <li>• Multiple thumbnail sizes improve grid performance but use more storage</li>
          <li>• Auto-tagging and duplicate detection add processing time</li>
          <li>• Consider disabling location-based albums if you don't use GPS data</li>
        </ul>
      </div>
    </div>
  );
};