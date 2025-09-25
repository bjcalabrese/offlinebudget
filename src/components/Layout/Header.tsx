import React from 'react';
import { motion } from 'framer-motion';
import { usePhotoStore } from '@/store/photoStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Grid3X3, 
  List, 
  MoreVertical,
  CheckSquare,
  Square,
  Trash2,
  Download,
  Share,
  Settings,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { Badge } from '@/components/ui/badge';

export const Header: React.FC = () => {
  const { 
    viewMode, 
    setViewMode, 
    selectedPhotos, 
    clearSelection, 
    deletePhotos,
    filter,
    setFilter 
  } = usePhotoStore();
  
  const { 
    isSelectionMode, 
    toggleSelectionMode,
    theme,
    setTheme 
  } = useUIStore();

  const { setTheme: setNextTheme } = useTheme();

  const selectedCount = selectedPhotos.size;

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setNextTheme(newTheme);
  };

  const handleDeleteSelected = () => {
    if (selectedCount > 0) {
      deletePhotos(Array.from(selectedPhotos));
      clearSelection();
    }
  };

  return (
    <header className="flex items-center justify-between p-4 bg-background border-b border-border">
      <div className="flex items-center space-x-4 flex-1">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search photos..."
            value={filter.search || ''}
            onChange={(e) => setFilter({ search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Selection Mode Badge */}
        {isSelectionMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Badge variant="secondary">
              {selectedCount} selected
            </Badge>
          </motion.div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Selection Mode Actions */}
        {isSelectionMode && selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center space-x-2"
          >
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4" />
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDeleteSelected}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {/* Selection Toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSelectionMode}
          className={isSelectionMode ? "bg-accent" : ""}
        >
          {isSelectionMode ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
        </Button>

        {/* View Mode Toggle */}
        <div className="flex border rounded-lg overflow-hidden">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="rounded-none"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('timeline')}
            className="rounded-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* More Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleThemeChange('light')}>
              <Sun className="mr-2 h-4 w-4" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleThemeChange('system')}>
              <Monitor className="mr-2 h-4 w-4" />
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};