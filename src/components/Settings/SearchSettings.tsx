import React from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  History, 
  Hash, 
  Calendar, 
  SortAsc,
  FileText,
  Settings,
  Sparkles
} from 'lucide-react';

export const SearchSettings: React.FC = () => {
  const { settings, updateSettings, savedSearches } = useSettingsStore();

  const handleSearchHistoryLengthChange = (value: string) => {
    const length = parseInt(value);
    if (!isNaN(length) && length >= 0) {
      updateSettings({ 
        search: { 
          ...settings.search, 
          searchHistoryLength: Math.min(length, 1000) 
        } 
      });
    }
  };

  const handleEnableAutoTaggingChange = (enableAutoTagging: boolean) => {
    updateSettings({ search: { ...settings.search, enableAutoTagging } });
  };

  const handleDateFormatChange = (dateFormat: string) => {
    updateSettings({ search: { ...settings.search, dateFormat } });
  };

  const handleSortOrderDefaultChange = (sortOrderDefault: 'newest' | 'oldest' | 'name') => {
    updateSettings({ search: { ...settings.search, sortOrderDefault } });
  };

  const clearSearchHistory = () => {
    // In a real implementation, this would clear the search history from IndexedDB
    console.log('Clearing search history...');
  };

  const formatDateExample = (format: string): string => {
    const now = new Date();
    try {
      if (format === 'MM/dd/yyyy') return now.toLocaleDateString('en-US');
      if (format === 'dd/MM/yyyy') return now.toLocaleDateString('en-GB');
      if (format === 'yyyy-MM-dd') return now.toISOString().split('T')[0];
      if (format === 'MMM dd, yyyy') return now.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      return now.toLocaleDateString();
    } catch {
      return now.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search History */}
      <div className="space-y-4">
        <Label className="text-base font-medium flex items-center">
          <History className="h-4 w-4 mr-2" />
          Search History
        </Label>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="search-history-length">Maximum Search History Items</Label>
            <div className="w-32">
              <Input
                id="search-history-length"
                type="number"
                min="0"
                max="1000"
                value={settings.search.searchHistoryLength}
                onChange={(e) => handleSearchHistoryLengthChange(e.target.value)}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Keep recent searches for quick access. Set to 0 to disable search history.
          </p>

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <span className="text-sm font-medium">Clear Search History</span>
              <p className="text-sm text-muted-foreground">
                Remove all saved search queries
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={clearSearchHistory}>
              <History className="h-4 w-4 mr-2" />
              Clear History
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Auto-tagging */}
      <div className="space-y-4">
        <Label className="text-base font-medium flex items-center">
          <Hash className="h-4 w-4 mr-2" />
          Smart Tagging
        </Label>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enable-auto-tagging" className="flex items-center">
              <Sparkles className="h-4 w-4 mr-2" />
              Enable Auto-tagging Rules
            </Label>
            <p className="text-sm text-muted-foreground">
              Automatically suggest tags based on filename patterns and metadata
            </p>
          </div>
          <Switch
            id="enable-auto-tagging"
            checked={settings.search.enableAutoTagging}
            onCheckedChange={handleEnableAutoTaggingChange}
          />
        </div>

        {settings.search.enableAutoTagging && (
          <div className="ml-6 space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">
                Auto-tagging Examples:
              </p>
              <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                <div>• Photos with "IMG_" prefix → "camera-import"</div>
                <div>• Screenshots → "screenshot"</div>
                <div>• Night mode photos → "night-mode"</div>
                <div>• Weekend uploads → "weekend"</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Date Format */}
      <div className="space-y-4">
        <Label className="text-base font-medium flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          Date Display
        </Label>

        <div className="space-y-2">
          <Label htmlFor="date-format">Date Format</Label>
          <Select value={settings.search.dateFormat} onValueChange={handleDateFormatChange}>
            <SelectTrigger id="date-format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MM/dd/yyyy">
                MM/dd/yyyy
                <Badge variant="outline" className="ml-2">
                  {formatDateExample('MM/dd/yyyy')}
                </Badge>
              </SelectItem>
              <SelectItem value="dd/MM/yyyy">
                dd/MM/yyyy
                <Badge variant="outline" className="ml-2">
                  {formatDateExample('dd/MM/yyyy')}
                </Badge>
              </SelectItem>
              <SelectItem value="yyyy-MM-dd">
                yyyy-MM-dd
                <Badge variant="outline" className="ml-2">
                  {formatDateExample('yyyy-MM-dd')}
                </Badge>
              </SelectItem>
              <SelectItem value="MMM dd, yyyy">
                MMM dd, yyyy
                <Badge variant="outline" className="ml-2">
                  {formatDateExample('MMM dd, yyyy')}
                </Badge>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            How dates are displayed throughout the app
          </p>
        </div>
      </div>

      <Separator />

      {/* Sort Order */}
      <div className="space-y-4">
        <Label className="text-base font-medium flex items-center">
          <SortAsc className="h-4 w-4 mr-2" />
          Default Sorting
        </Label>

        <div className="space-y-2">
          <Label htmlFor="sort-order">Default Sort Order</Label>
          <Select value={settings.search.sortOrderDefault} onValueChange={handleSortOrderDefaultChange}>
            <SelectTrigger id="sort-order">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            How photos are sorted when you first open the app
          </p>
        </div>
      </div>

      <Separator />

      {/* Saved Searches */}
      <div className="space-y-4">
        <Label className="text-base font-medium flex items-center">
          <Search className="h-4 w-4 mr-2" />
          Saved Searches
        </Label>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-medium">Current Saved Searches</span>
              <p className="text-sm text-muted-foreground">
                Bookmark complex search queries for quick access
              </p>
            </div>
            <Badge variant="secondary">
              {savedSearches.length} saved
            </Badge>
          </div>

          {savedSearches.length > 0 ? (
            <div className="space-y-2">
              {savedSearches.slice(0, 3).map(search => (
                <div key={search.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm font-medium">{search.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {new Date(search.lastUsed).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
              {savedSearches.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{savedSearches.length - 3} more saved searches
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No saved searches yet</p>
              <p className="text-xs">Save complex searches from the search bar</p>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Search Performance */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-2 flex items-center">
          <Settings className="h-4 w-4 mr-2" />
          🔍 Search Performance Tips
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Use specific tags for faster results</li>
          <li>• Date range filters significantly speed up large libraries</li>
          <li>• Auto-tagging helps organize photos for better searchability</li>
          <li>• Consider shorter search history for better performance</li>
          <li>• Saved searches provide instant access to complex queries</li>
        </ul>
      </div>
    </div>
  );
};