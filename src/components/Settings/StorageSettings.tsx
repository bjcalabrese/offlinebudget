import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { photoDatabase } from '@/services/database';
import { fileManager } from '@/services/fileManager';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { 
  HardDrive, 
  Trash2, 
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { StorageInfo } from '@/types/photo';

export const StorageSettings: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [lastCleanup, setLastCleanup] = useState<Date | null>(null);

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    try {
      const info = await fileManager.estimateStorageUsage();
      setStorageInfo(info);
    } catch (error) {
      console.error('Failed to load storage info:', error);
    }
  };

  const handleMaxCacheSizeChange = (value: string) => {
    const size = parseInt(value);
    if (!isNaN(size) && size > 0) {
      updateSettings({ storage: { ...settings.storage, maxCacheSize: size } });
    }
  };

  const handleAutoCleanupChange = (autoCleanup: boolean) => {
    updateSettings({ storage: { ...settings.storage, autoCleanup } });
  };

  const handleCompressionLevelChange = (value: number[]) => {
    updateSettings({ storage: { ...settings.storage, compressionLevel: value[0] } });
  };

  const handleBackgroundSyncChange = (backgroundSync: boolean) => {
    updateSettings({ storage: { ...settings.storage, backgroundSync } });
  };

  const handleMemoryLimitChange = (value: number[]) => {
    updateSettings({ storage: { ...settings.storage, memoryUsageLimit: value[0] } });
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await photoDatabase.cleanup();
      fileManager.cleanup();
      await loadStorageInfo();
      setLastCleanup(new Date());
    } catch (error) {
      console.error('Failed to clear cache:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStorageUsagePercentage = (): number => {
    if (!storageInfo || !storageInfo.availableSpace) return 0;
    const used = storageInfo.totalSize + storageInfo.thumbnailSize;
    const total = used + storageInfo.availableSpace;
    return Math.round((used / total) * 100);
  };

  const getCacheUsagePercentage = (): number => {
    if (!storageInfo) return 0;
    const maxCacheMB = settings.storage.maxCacheSize;
    const usedMB = storageInfo.thumbnailSize / (1024 * 1024);
    return Math.min(Math.round((usedMB / maxCacheMB) * 100), 100);
  };

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <div className="space-y-4">
        <Label className="text-base font-medium flex items-center">
          <HardDrive className="h-4 w-4 mr-2" />
          Storage Overview
        </Label>
        
        {storageInfo ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Photos</span>
                  <Badge variant="secondary">{storageInfo.photoCount}</Badge>
                </div>
                <p className="text-lg font-semibold mt-1">
                  {formatFileSize(storageInfo.totalSize)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Thumbnails</span>
                  <Badge variant="outline">Cache</Badge>
                </div>
                <p className="text-lg font-semibold mt-1">
                  {formatFileSize(storageInfo.thumbnailSize)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Available</span>
                  <Badge variant={getStorageUsagePercentage() > 80 ? "destructive" : "default"}>
                    {getStorageUsagePercentage()}%
                  </Badge>
                </div>
                <p className="text-lg font-semibold mt-1">
                  {storageInfo.availableSpace ? formatFileSize(storageInfo.availableSpace) : 'Unknown'}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading storage information...</span>
          </div>
        )}
      </div>

      <Separator />

      {/* Cache Management */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Cache Management</Label>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="max-cache-size">Maximum Cache Size (MB)</Label>
            <div className="w-32">
              <Input
                id="max-cache-size"
                type="number"
                min="100"
                max="10000"
                value={settings.storage.maxCacheSize}
                onChange={(e) => handleMaxCacheSizeChange(e.target.value)}
              />
            </div>
          </div>
          
          {storageInfo && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Cache Usage</span>
                <span>{getCacheUsagePercentage()}% of {settings.storage.maxCacheSize}MB</span>
              </div>
              <Progress value={getCacheUsagePercentage()} />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-cleanup">Auto-cleanup Old Thumbnails</Label>
            <p className="text-sm text-muted-foreground">
              Automatically remove unused thumbnails to save space
            </p>
          </div>
          <Switch
            id="auto-cleanup"
            checked={settings.storage.autoCleanup}
            onCheckedChange={handleAutoCleanupChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-sm font-medium">Manual Cache Cleanup</span>
            <p className="text-sm text-muted-foreground">
              Clear all cached thumbnails and temporary files
            </p>
            {lastCleanup && (
              <p className="text-xs text-muted-foreground">
                Last cleanup: {lastCleanup.toLocaleString()}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCache}
            disabled={isClearing}
          >
            {isClearing ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            {isClearing ? 'Clearing...' : 'Clear Cache'}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Compression Settings */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Image Compression</Label>
        
        <div className="space-y-3">
          <Label htmlFor="compression-level">Default Compression Level</Label>
          <div className="px-3">
            <Slider
              id="compression-level"
              min={10}
              max={100}
              step={5}
              value={[settings.storage.compressionLevel]}
              onValueChange={handleCompressionLevelChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Smaller Size</span>
              <span>Better Quality</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Current level: {settings.storage.compressionLevel}% (
            {settings.storage.compressionLevel < 50 ? 'High compression' :
             settings.storage.compressionLevel < 80 ? 'Balanced' : 'Low compression'})
          </p>
        </div>
      </div>

      <Separator />

      {/* Performance Settings */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Performance</Label>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="background-sync">Background Sync</Label>
            <p className="text-sm text-muted-foreground">
              Sync data in the background for better responsiveness
            </p>
          </div>
          <Switch
            id="background-sync"
            checked={settings.storage.backgroundSync}
            onCheckedChange={handleBackgroundSyncChange}
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="memory-limit">Memory Usage Limit (MB)</Label>
          <div className="px-3">
            <Slider
              id="memory-limit"
              min={100}
              max={2000}
              step={50}
              value={[settings.storage.memoryUsageLimit]}
              onValueChange={handleMemoryLimitChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>100MB</span>
              <span>1GB</span>
              <span>2GB</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Current limit: {settings.storage.memoryUsageLimit}MB
          </p>
        </div>
      </div>

      {/* Warning for low storage */}
      {storageInfo && getStorageUsagePercentage() > 80 && (
        <div className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3" />
          <div>
            <p className="font-medium text-yellow-800 dark:text-yellow-200">
              Storage space is running low
            </p>
            <p className="text-sm text-yellow-600 dark:text-yellow-300">
              Consider enabling auto-cleanup or manually clearing the cache to free up space.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};