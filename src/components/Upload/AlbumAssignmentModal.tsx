import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAlbumStore } from '@/store/albumStore';
import { Album } from '@/types/album';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Plus,
  Folder,
  Calendar,
  MapPin,
  Image,
  Check,
  X
} from 'lucide-react';

interface AlbumAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (albumIds: string[], createNewAlbum?: string, autoRules?: AlbumAutoRules) => void;
  selectedFiles: File[];
}

interface AlbumAutoRules {
  byDate: boolean;
  byLocation: boolean;
  byFilename: boolean;
}

export const AlbumAssignmentModal: React.FC<AlbumAssignmentModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  selectedFiles
}) => {
  const { albums, loadAlbums } = useAlbumStore();
  const [selectedAlbums, setSelectedAlbums] = useState<string[]>([]);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [autoRules, setAutoRules] = useState<AlbumAutoRules>({
    byDate: false,
    byLocation: false,
    byFilename: false
  });

  useEffect(() => {
    if (isOpen) {
      loadAlbums();
    }
  }, [isOpen, loadAlbums]);

  const handleAlbumToggle = (albumId: string) => {
    setSelectedAlbums(prev => 
      prev.includes(albumId) 
        ? prev.filter(id => id !== albumId)
        : [...prev, albumId]
    );
  };

  const handleAssign = () => {
    const albumIds = [...selectedAlbums];
    const createNew = showCreateNew && newAlbumName.trim() ? newAlbumName.trim() : undefined;
    
    onAssign(albumIds, createNew, autoRules);
    
    // Reset state
    setSelectedAlbums([]);
    setShowCreateNew(false);
    setNewAlbumName('');
    setAutoRules({ byDate: false, byLocation: false, byFilename: false });
  };

  const handleClose = () => {
    setSelectedAlbums([]);
    setShowCreateNew(false);
    setNewAlbumName('');
    setAutoRules({ byDate: false, byLocation: false, byFilename: false });
    onClose();
  };

  const getSuggestedAlbumName = (): string => {
    if (selectedFiles.length === 0) return '';
    
    // Suggest based on current date
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();
    
    return `${month} ${year}`;
  };

  const regularAlbums = albums.filter(album => !album.isSmartAlbum);
  const smartAlbums = albums.filter(album => album.isSmartAlbum);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Folder className="h-5 w-5 mr-2" />
            Assign to Albums
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* File Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Image className="h-5 w-5 mr-2 text-muted-foreground" />
                <span className="font-medium">
                  {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <Badge variant="secondary">
                {Math.round(selectedFiles.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024 * 100) / 100} MB
              </Badge>
            </div>
          </div>

          {/* Existing Albums */}
          <div>
            <Label className="text-base font-medium">Existing Albums</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Select one or more albums to add photos to
            </p>
            
            {regularAlbums.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                {regularAlbums.map(album => (
                  <Card 
                    key={album.id}
                    className={`cursor-pointer transition-colors ${
                      selectedAlbums.includes(album.id) 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleAlbumToggle(album.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0">
                          <Folder className="h-4 w-4 mr-2 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{album.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {album.photoIds.length} photo{album.photoIds.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <Checkbox
                          checked={selectedAlbums.includes(album.id)}
                          onChange={() => {}} // Handled by card click
                          className="ml-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No albums yet. Create your first album below.</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Create New Album */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-medium">Create New Album</Label>
              <Switch
                checked={showCreateNew}
                onCheckedChange={setShowCreateNew}
              />
            </div>
            
            {showCreateNew && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <Input
                  placeholder={getSuggestedAlbumName()}
                  value={newAlbumName}
                  onChange={(e) => setNewAlbumName(e.target.value)}
                  autoFocus
                />
                
                {/* Auto-creation Rules */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Auto-creation Rules</Label>
                  <div className="space-y-2 pl-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto-date"
                        checked={autoRules.byDate}
                        onCheckedChange={(checked) => 
                          setAutoRules(prev => ({ ...prev, byDate: checked }))
                        }
                        size="sm"
                      />
                      <Label htmlFor="auto-date" className="text-sm flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Group by date
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto-location"
                        checked={autoRules.byLocation}
                        onCheckedChange={(checked) => 
                          setAutoRules(prev => ({ ...prev, byLocation: checked }))
                        }
                        size="sm"
                      />
                      <Label htmlFor="auto-location" className="text-sm flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        Group by location
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto-filename"
                        checked={autoRules.byFilename}
                        onCheckedChange={(checked) => 
                          setAutoRules(prev => ({ ...prev, byFilename: checked }))
                        }
                        size="sm"
                      />
                      <Label htmlFor="auto-filename" className="text-sm">
                        Auto-tag from filename
                      </Label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Smart Albums Info */}
          {smartAlbums.length > 0 && (
            <>
              <Separator />
              <div>
                <Label className="text-base font-medium">Smart Albums</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Photos will automatically appear in these albums based on criteria
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {smartAlbums.map(album => (
                    <div key={album.id} className="flex items-center p-2 bg-muted/30 rounded">
                      <Folder className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm font-medium">{album.name}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        Smart
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Skip
          </Button>
          
          <Button 
            onClick={handleAssign}
            disabled={selectedAlbums.length === 0 && !showCreateNew}
          >
            <Check className="h-4 w-4 mr-2" />
            Assign Albums
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};