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
  const { photos, filter, setFilter } = usePhotoStore();
  const [searchQuery, setSearchQuery] = useState(filter.search || '');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });

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