import React, { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { photoDatabase } from '@/services/database';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  MapPin, 
  Eye, 
  Download, 
  Upload,
  Trash2,
  Database,
  AlertTriangle,
  FileText,
  Settings
} from 'lucide-react';

export const PrivacySettings: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleStripMetadataChange = (stripMetadata: boolean) => {
    updateSettings({ privacy: { ...settings.privacy, stripMetadata } });
  };

  const handleKeepLocationDataChange = (keepLocationData: boolean) => {
    updateSettings({ privacy: { ...settings.privacy, keepLocationData } });
  };

  const handleEnableAnalyticsChange = (enableAnalytics: boolean) => {
    updateSettings({ privacy: { ...settings.privacy, enableAnalytics } });
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Get all data from IndexedDB
      const [photos, albums, tags] = await Promise.all([
        photoDatabase.getAllPhotos(),
        photoDatabase.getAllAlbums(),
        photoDatabase.getAllTags()
      ]);

      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        photos: photos.map(photo => ({
          ...photo,
          // Don't export actual blobs for privacy/size reasons
          fileBlob: undefined,
          thumbnailBlob: undefined,
          // Convert dates to strings for JSON
          createdAt: photo.createdAt.toISOString(),
          uploadedAt: photo.uploadedAt.toISOString(),
          takenAt: photo.takenAt?.toISOString()
        })),
        albums: albums.map(album => ({
          ...album,
          createdAt: album.createdAt.toISOString(),
          updatedAt: album.updatedAt.toISOString()
        })),
        tags: tags.map(tag => ({
          ...tag,
          createdAt: tag.createdAt.toISOString()
        })),
        settings
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `photos-app-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearAllData = async () => {
    setIsClearing(true);
    try {
      // Clear all IndexedDB data
      const dbName = 'PhotosApp';
      if ('indexedDB' in window) {
        // Close any existing connections
        // Note: This is a simplified version. A production app would need more robust cleanup
        const deleteRequest = indexedDB.deleteDatabase(dbName);
        await new Promise((resolve, reject) => {
          deleteRequest.onsuccess = () => resolve(undefined);
          deleteRequest.onerror = () => reject(deleteRequest.error);
        });
      }
      
      // Clear localStorage settings
      localStorage.removeItem('photos-settings');
      
      // Reload the page to reset the app state
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear data:', error);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metadata Privacy */}
      <div className="space-y-4">
        <Label className="text-base font-medium flex items-center">
          <Shield className="h-4 w-4 mr-2" />
          Metadata Privacy
        </Label>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="strip-metadata">Strip Metadata from Exports</Label>
            <p className="text-sm text-muted-foreground">
              Remove EXIF data and other metadata when exporting photos
            </p>
          </div>
          <Switch
            id="strip-metadata"
            checked={settings.privacy.stripMetadata}
            onCheckedChange={handleStripMetadataChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="keep-location" className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Keep Location Data
            </Label>
            <p className="text-sm text-muted-foreground">
              Store GPS coordinates and location information from photos
            </p>
          </div>
          <Switch
            id="keep-location"
            checked={settings.privacy.keepLocationData}
            onCheckedChange={handleKeepLocationDataChange}
          />
        </div>

        {!settings.privacy.keepLocationData && (
          <div className="ml-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start">
              <Eye className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Location features disabled
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
                  Albums by location and map view will not be available
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Analytics */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Usage Analytics</Label>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enable-analytics">Enable Anonymous Analytics</Label>
            <p className="text-sm text-muted-foreground">
              Help improve the app by sharing anonymous usage statistics
            </p>
          </div>
          <Switch
            id="enable-analytics"
            checked={settings.privacy.enableAnalytics}
            onCheckedChange={handleEnableAnalyticsChange}
          />
        </div>

        {settings.privacy.enableAnalytics && (
          <div className="ml-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>What we collect:</strong> App usage patterns, performance metrics, 
              and error reports. We never collect your photos, personal data, or file names.
            </p>
          </div>
        )}
      </div>

      <Separator />

      {/* Data Export/Import */}
      <div className="space-y-4">
        <Label className="text-base font-medium flex items-center">
          <Database className="h-4 w-4 mr-2" />
          Data Management
        </Label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export Your Data
            </Label>
            <p className="text-sm text-muted-foreground">
              Download all your photos metadata, albums, and settings
            </p>
            <Button
              variant="outline"
              onClick={handleExportData}
              disabled={isExporting}
              className="w-full"
            >
              {isExporting ? (
                <>
                  <Download className="h-4 w-4 mr-2 animate-pulse" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Label>
            <p className="text-sm text-muted-foreground">
              Restore data from a previous export file
            </p>
            <Button
              variant="outline"
              disabled
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Data
              <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Clear All Data */}
      <div className="space-y-4">
        <Label className="text-base font-medium flex items-center text-destructive">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Danger Zone
        </Label>

        <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <Label className="text-destructive">Clear All Data</Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete all photos, albums, settings, and cached data. 
                This action cannot be undone.
              </p>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isClearing}>
                  {isClearing ? (
                    <>
                      <Trash2 className="h-4 w-4 mr-2 animate-pulse" />
                      Clearing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center text-destructive">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently delete:
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                      <li>All uploaded photos and their metadata</li>
                      <li>All albums and organization</li>
                      <li>All tags and saved searches</li>
                      <li>All settings and preferences</li>
                      <li>All cached thumbnails and data</li>
                    </ul>
                    <p className="mt-3 font-medium">
                      This action cannot be undone. Make sure to export your data first if you want to keep it.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleClearAllData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, delete everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Privacy Information */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-2 flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          🔒 Your Privacy Matters
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• All photos and data are stored locally on your device</li>
          <li>• No data is sent to external servers without your consent</li>
          <li>• You have complete control over your data export and deletion</li>
          <li>• Metadata stripping helps protect privacy when sharing photos</li>
        </ul>
      </div>
    </div>
  );
};