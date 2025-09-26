import React, { useState, useEffect, useCallback } from 'react';
import { usePhotoStore } from '@/store/photoStore';
import { useAlbumStore } from '@/store/albumStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Photo, PhotoFilter } from '@/types/photo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  Calendar as CalendarIcon, 
  Tag, 
  Folder, 
  Image,
  X,
  Save,
  Filter,
  Clock,
  Star,
  MapPin,
  Camera,
  Sliders
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AdvancedSearchProps {
  onSearchResults: (photos: Photo[]) => void;
  className?: string;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearchResults,
  className
}) => {
  const { photos, searchPhotos } = usePhotoStore();
  const { albums } = useAlbumStore();
  const { settings, addSavedSearch, savedSearches } = useSettingsStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<PhotoFilter>({});
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedAlbums, setSelectedAlbums] = useState<string[]>([]);
  const [fileSizeMin, setFileSizeMin] = useState<number>();
  const [fileSizeMax, setFileSizeMax] = useState<number>();
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Photo[]>([]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce(async () => {
      if (!searchQuery.trim() && Object.keys(filters).length === 0) {
        setSearchResults([]);
        onSearchResults([]);
        return;
      }

      setIsSearching(true);
      
      try {
        let results = photos;

        // Text search
        if (searchQuery.trim()) {
          results = await searchPhotos(searchQuery.trim());
        }

        // Apply filters
        results = results.filter(photo => {
          // Date filter
          if (dateFrom || dateTo) {
            const photoDate = photo.takenAt || photo.uploadedAt;
            if (dateFrom && photoDate < dateFrom) return false;
            if (dateTo && photoDate > dateTo) return false;
          }

          // Tags filter
          if (selectedTags.length > 0) {
            const hasAllTags = selectedTags.every(tag => 
              photo.tags.some(photoTag => 
                photoTag.toLowerCase().includes(tag.toLowerCase())
              )
            );
            if (!hasAllTags) return false;
          }

          // Album filter
          if (selectedAlbums.length > 0) {
            const hasAllAlbums = selectedAlbums.every(albumId => 
              photo.albumIds.includes(albumId)
            );
            if (!hasAllAlbums) return false;
          }

          // File size filter
          if (fileSizeMin && photo.size < fileSizeMin * 1024 * 1024) return false;
          if (fileSizeMax && photo.size > fileSizeMax * 1024 * 1024) return false;

          // Favorites filter
          if (filters.isFavorite !== undefined && photo.isFavorite !== filters.isFavorite) {
            return false;
          }

          // Location filter
          if (filters.location && !photo.metadata.location) return false;

          return true;
        });

        setSearchResults(results);
        onSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
        onSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [searchQuery, filters, dateFrom, dateTo, selectedTags, selectedAlbums, fileSizeMin, fileSizeMax, photos, searchPhotos, onSearchResults]
  );

  useEffect(() => {
    debouncedSearch();
  }, [debouncedSearch]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilters({});
    setDateFrom(undefined);
    setDateTo(undefined);
    setSelectedTags([]);
    setSelectedAlbums([]);
    setFileSizeMin(undefined);
    setFileSizeMax(undefined);
    setSearchResults([]);
    onSearchResults([]);
  };

  const saveSearch = () => {
    const searchName = searchQuery || 'Advanced Search';
    addSavedSearch({
      name: searchName,
      query: searchQuery,
      filters: {
        ...filters,
        dateFrom,
        dateTo,
        tags: selectedTags,
        albumId: selectedAlbums[0] // Simplified for now
      }
    });
  };

  const formatFileSize = (mb: number) => {
    if (mb < 1) return `${Math.round(mb * 1000)}KB`;
    return `${mb}MB`;
  };

  // Get unique tags from all photos
  const allTags = Array.from(new Set(photos.flatMap(photo => photo.tags))).sort();

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Search className="h-5 w-5 mr-2" />
          Advanced Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Text Search */}
        <div className="space-y-2">
          <Label htmlFor="search-query">Search Photos</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-query"
              placeholder="Search by filename, tags, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Separator />

        {/* Date Range */}
        <div className="space-y-3">
          <Label className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Date Range
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm">From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">To</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <Separator />

        {/* Tags */}
        <div className="space-y-3">
          <Label className="flex items-center">
            <Tag className="h-4 w-4 mr-2" />
            Tags
          </Label>
          <Select onValueChange={(tag) => {
            if (!selectedTags.includes(tag)) {
              setSelectedTags([...selectedTags, tag]);
            }
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Add tags to filter..." />
            </SelectTrigger>
            <SelectContent>
              {allTags
                .filter(tag => !selectedTags.includes(tag))
                .map(tag => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedTags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Albums */}
        <div className="space-y-3">
          <Label className="flex items-center">
            <Folder className="h-4 w-4 mr-2" />
            Albums
          </Label>
          <Select onValueChange={(albumId) => {
            if (!selectedAlbums.includes(albumId)) {
              setSelectedAlbums([...selectedAlbums, albumId]);
            }
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by albums..." />
            </SelectTrigger>
            <SelectContent>
              {albums
                .filter(album => !selectedAlbums.includes(album.id))
                .map(album => (
                  <SelectItem key={album.id} value={album.id}>
                    {album.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {selectedAlbums.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedAlbums.map(albumId => {
                const album = albums.find(a => a.id === albumId);
                return album ? (
                  <Badge key={albumId} variant="secondary" className="flex items-center gap-1">
                    {album.name}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setSelectedAlbums(selectedAlbums.filter(id => id !== albumId))}
                    />
                  </Badge>
                ) : null;
              })}
            </div>
          )}
        </div>

        <Separator />

        {/* File Size */}
        <div className="space-y-3">
          <Label className="flex items-center">
            <Image className="h-4 w-4 mr-2" />
            File Size (MB)
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm">Min Size</Label>
              <Input
                type="number"
                placeholder="0"
                value={fileSizeMin || ''}
                onChange={(e) => setFileSizeMin(e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Max Size</Label>
              <Input
                type="number"
                placeholder="100"
                value={fileSizeMax || ''}
                onChange={(e) => setFileSizeMax(e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Quick Filters */}
        <div className="space-y-3">
          <Label className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Quick Filters
          </Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.isFavorite === true ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters(prev => ({
                ...prev,
                isFavorite: prev.isFavorite === true ? undefined : true
              }))}
            >
              <Star className="h-4 w-4 mr-1" />
              Favorites
            </Button>
            
            <Button
              variant={filters.location === true ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters(prev => ({
                ...prev,
                location: prev.location === true ? undefined : true
              }))}
            >
              <MapPin className="h-4 w-4 mr-1" />
              Has Location
            </Button>
          </div>
        </div>

        {/* Search Actions */}
        <div className="flex justify-between pt-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              disabled={!searchQuery && Object.keys(filters).length === 0 && selectedTags.length === 0}
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={saveSearch}
              disabled={!searchQuery && Object.keys(filters).length === 0}
            >
              <Save className="h-4 w-4 mr-1" />
              Save Search
            </Button>
          </div>

          <Badge variant="secondary">
            {isSearching ? (
              <Clock className="h-4 w-4 mr-1 animate-pulse" />
            ) : (
              <Image className="h-4 w-4 mr-1" />
            )}
            {isSearching ? 'Searching...' : `${searchResults.length} results`}
          </Badge>
        </div>

        {/* Saved Searches Quick Access */}
        {savedSearches.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm font-medium">Recent Searches</Label>
              <div className="flex flex-wrap gap-2">
                {savedSearches.slice(0, 3).map(search => (
                  <Button
                    key={search.id}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery(search.query);
                      if (search.filters.dateFrom) setDateFrom(new Date(search.filters.dateFrom));
                      if (search.filters.dateTo) setDateTo(new Date(search.filters.dateTo));
                      if (search.filters.tags) setSelectedTags(search.filters.tags);
                    }}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {search.name}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  }) as T;
}