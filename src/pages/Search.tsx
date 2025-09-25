import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout/Layout';
import { PhotoGrid } from '@/components/PhotoGrid/PhotoGrid';
import { PhotoViewer } from '@/components/PhotoViewer/PhotoViewer';
import { usePhotoStore } from '@/store/photoStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search as SearchIcon, X, Filter, Calendar, Tag } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export const Search: React.FC = () => {
  const { photos, filter, setFilter, setPhotos } = usePhotoStore();
  const [searchQuery, setSearchQuery] = useState(filter.search || '');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });

  // Load mock photos if not already loaded
  useEffect(() => {
    if (photos.length === 0) {
      // Import the same mock photos as Photos page
      const mockPhotos = [
        {
          id: '1',
          filename: 'sunset-beach.jpg',
          url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0ZGNkI2QiIvPiAgICAgIDx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSI+U3Vuc2V0IEJlYWNoPC90ZXh0PiAgICA8L3N2Zz4=',
          thumbnailUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0ZGNkI2QiIvPiAgICAgIDx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSI+U3Vuc2V0IEJlYWNoPC90ZXh0PiAgICA8L3N2Zz4=',
          size: 2048000,
          dimensions: { width: 4000, height: 3000 },
          createdAt: new Date('2024-01-15'),
          takenAt: new Date('2024-01-15'),
          tags: ['sunset', 'beach', 'nature'],
          albumIds: [],
          isFavorite: true
        },
        {
          id: '2',
          filename: 'mountain-lake.jpg',
          url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzRFQ0RDNCI+PC9yZWN0PiAgICAgIDx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSI+TW91bnRhaW4gTGFrZTwvdGV4dD4gICAgPC9zdmc+',
          thumbnailUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzRFQ0RDNCI+PC9yZWN0PiAgICAgIDx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSI+TW91bnRhaW4gTGFrZTwvdGV4dD4gICAgPC9zdmc+',
          size: 1856000,
          dimensions: { width: 3840, height: 2560 },
          createdAt: new Date('2024-01-14'),
          takenAt: new Date('2024-01-14'),
          tags: ['mountain', 'lake', 'landscape'],
          albumIds: [],
          isFavorite: false
        },
        {
          id: '3',
          filename: 'city-night.jpg',
          url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzQ1QjdEMSI+PC9yZWN0PiAgICAgIDx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSI+Q2l0eSBOaWdodDwvdGV4dD4gICAgPC9zdmc+',
          thumbnailUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzQ1QjdEMSI+PC9yZWN0PiAgICAgIDx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSI+Q2l0eSBOaWdodDwvdGV4dD4gICAgPC9zdmc+',
          size: 2240000,
          dimensions: { width: 4200, height: 2800 },
          createdAt: new Date('2024-01-13'),
          takenAt: new Date('2024-01-13'),
          tags: ['city', 'night', 'urban'],
          albumIds: [],
          isFavorite: false
        },
        {
          id: '4',
          filename: 'forest-path.jpg',
          url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzk2Q0VCNCI+PC9yZWN0PiAgICAgIDx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSI+Rm9yZXN0IFBhdGg8L3RleHQ+ICAgIDwvc3ZnPg==',
          thumbnailUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzk2Q0VCNCI+PC9yZWN0PiAgICAgIDx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSI+Rm9yZXN0IFBhdGg8L3RleHQ+ICAgIDwvc3ZnPg==',
          size: 1920000,
          dimensions: { width: 3600, height: 2400 },
          createdAt: new Date('2024-01-12'),
          takenAt: new Date('2024-01-12'),
          tags: ['forest', 'path', 'nature'],
          albumIds: [],
          isFavorite: true
        },
        {
          id: '5',
          filename: 'ocean-waves.jpg',
          url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzc0QjlGRiI+PC9yZWN0PiAgICAgIDx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSI+T2NlYW4gV2F2ZXM8L3RleHQ+ICAgIDwvc3ZnPg==',
          thumbnailUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzc0QjlGRiI+PC9yZWN0PiAgICAgIDx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSI+T2NlYW4gV2F2ZXM8L3RleHQ+ICAgIDwvc3ZnPg==',
          size: 2304000,
          dimensions: { width: 4000, height: 3000 },
          createdAt: new Date('2024-01-11'),
          takenAt: new Date('2024-01-11'),
          tags: ['ocean', 'waves', 'water'],
          albumIds: [],
          isFavorite: false
        },
        {
          id: '6',
          filename: 'desert-dunes.jpg',
          url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0ZEQ0I2RSI+PC9yZWN0PiAgICAgIDx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSI+RGVzZXJ0IER1bmVzPC90ZXh0PiAgICA8L3N2Zz4=',
          thumbnailUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0ZEQ0I2RSI+PC9yZWN0PiAgICAgIDx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSI+RGVzZXJ0IER1bmVzPC90ZXh0PiAgICA8L3N2Zz4=',
          size: 2112000,
          dimensions: { width: 3800, height: 2533 },
          createdAt: new Date('2024-01-10'),
          takenAt: new Date('2024-01-10'),
          tags: ['desert', 'sand', 'landscape'],
          albumIds: [],
          isFavorite: false
        }
      ];
      setPhotos(mockPhotos);
    }
  }, [photos.length, setPhotos]);

  // Update store filter when search changes
  useEffect(() => {
    setFilter({
      search: searchQuery,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      dateFrom: dateRange.from ? new Date(dateRange.from) : undefined,
      dateTo: dateRange.to ? new Date(dateRange.to) : undefined
    });
  }, [searchQuery, selectedTags, dateRange, setFilter]);

  // Get all unique tags from photos
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    photos.forEach(photo => {
      photo.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [photos]);

  // Filter photos based on search criteria
  const filteredPhotos = useMemo(() => {
    return photos.filter(photo => {
      // Text search in filename and tags
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesFilename = photo.filename.toLowerCase().includes(query);
        const matchesTags = photo.tags?.some(tag => 
          tag.toLowerCase().includes(query)
        );
        if (!matchesFilename && !matchesTags) return false;
      }

      // Tag filter
      if (selectedTags.length > 0) {
        const hasTag = selectedTags.some(tag => 
          photo.tags?.includes(tag)
        );
        if (!hasTag) return false;
      }

      // Date range filter
      if (dateRange.from) {
        const fromDate = new Date(dateRange.from);
        if (photo.createdAt < fromDate) return false;
      }
      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (photo.createdAt > toDate) return false;
      }

      return true;
    });
  }, [photos, searchQuery, selectedTags, dateRange]);

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setDateRange({ from: '', to: '' });
    setFilter({});
  };

  // Recent searches (could be stored in localStorage in real app)
  const recentSearches = ['sunset', 'beach', 'mountain', 'city'];

  return (
    <Layout>
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-border">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Search Photos</h1>
              <p className="text-muted-foreground mt-1">
                Find your photos by name, tags, or date
              </p>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search photos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Quick Tags */}
            {!searchQuery && selectedTags.length === 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Popular tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTags.slice(0, 8).map(tag => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Active Filters */}
            {(searchQuery || selectedTags.length > 0 || dateRange.from || dateRange.to) && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Active filters</span>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchQuery && (
                    <Badge variant="default" className="flex items-center gap-1">
                      Search: "{searchQuery}"
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setSearchQuery('')}
                      />
                    </Badge>
                  )}
                  {selectedTags.map(tag => (
                    <Badge key={tag} variant="default" className="flex items-center gap-1">
                      Tag: {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => toggleTag(tag)}
                      />
                    </Badge>
                  ))}
                  {dateRange.from && (
                    <Badge variant="default" className="flex items-center gap-1">
                      From: {new Date(dateRange.from).toLocaleDateString()}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setDateRange(prev => ({ ...prev, from: '' }))}
                      />
                    </Badge>
                  )}
                  {dateRange.to && (
                    <Badge variant="default" className="flex items-center gap-1">
                      To: {new Date(dateRange.to).toLocaleDateString()}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setDateRange(prev => ({ ...prev, to: '' }))}
                      />
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Advanced Filters */}
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="mb-4">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced Filters
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Advanced Search</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Date Range */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Date Range</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground">From</label>
                          <Input
                            type="date"
                            value={dateRange.from}
                            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">To</label>
                          <Input
                            type="date"
                            value={dateRange.to}
                            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Tag Selection */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tags</label>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                        {allTags.map(tag => (
                          <Badge
                            key={tag}
                            variant={selectedTags.includes(tag) ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => toggleTag(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>

            {/* Results Summary */}
            <div className="text-sm text-muted-foreground">
              {filteredPhotos.length} {filteredPhotos.length === 1 ? 'photo' : 'photos'} found
            </div>
          </motion.div>
        </div>

        {/* Results */}
        <div className="flex-1 p-4">
          {filteredPhotos.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="h-full"
            >
              <PhotoGrid photos={filteredPhotos} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-96 text-muted-foreground"
            >
              <SearchIcon className="h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium mb-2">No photos found</h3>
              <p className="text-sm text-center">
                {searchQuery || selectedTags.length > 0 || dateRange.from || dateRange.to
                  ? "Try adjusting your search criteria"
                  : "Start typing to search your photos"
                }
              </p>
            </motion.div>
          )}
        </div>
      </div>
      
      <PhotoViewer />
    </Layout>
  );
};