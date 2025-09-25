import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout/Layout';
import { useAlbumStore } from '@/store/albumStore';
import { usePhotoStore } from '@/store/photoStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Images, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Album } from '@/types/album';

export const Albums: React.FC = () => {
  const { albums, addAlbum, updateAlbum, deleteAlbum } = useAlbumStore();
  const { photos } = usePhotoStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Create a new album
  const handleCreateAlbum = () => {
    if (!formData.name.trim()) return;

    const newAlbum: Album = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      photoIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isSmartAlbum: false
    };

    addAlbum(newAlbum);
    setFormData({ name: '', description: '' });
    setIsCreateModalOpen(false);
  };

  // Update existing album
  const handleUpdateAlbum = () => {
    if (!editingAlbum || !formData.name.trim()) return;

    updateAlbum(editingAlbum.id, {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      updatedAt: new Date()
    });

    setEditingAlbum(null);
    setFormData({ name: '', description: '' });
  };

  // Delete album
  const handleDeleteAlbum = (albumId: string) => {
    deleteAlbum(albumId);
  };

  // Open edit modal
  const handleEditAlbum = (album: Album) => {
    setEditingAlbum(album);
    setFormData({
      name: album.name,
      description: album.description || ''
    });
  };

  // Get cover photo for album
  const getAlbumCoverPhoto = (album: Album) => {
    const coverPhoto = photos.find(photo => photo.id === album.coverPhotoId) ||
                      photos.find(photo => album.photoIds.includes(photo.id));
    return coverPhoto?.thumbnailUrl;
  };

  // Calculate photo count for album
  const getPhotoCount = (album: Album) => {
    return album.photoIds.length;
  };

  return (
    <Layout>
      <div className="h-full p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Albums</h1>
              <p className="text-muted-foreground mt-1">
                Organize your photos into collections
              </p>
            </div>
            
            {/* Create Album Button */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Album
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Album</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="album-name">Album Name</Label>
                    <Input
                      id="album-name"
                      placeholder="Enter album name..."
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="album-description">Description (Optional)</Label>
                    <Textarea
                      id="album-description"
                      placeholder="Enter album description..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateAlbum} disabled={!formData.name.trim()}>
                      Create Album
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Albums Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {albums.map((album) => (
                <motion.div
                  key={album.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="p-0">
                      <div className="aspect-square bg-muted flex items-center justify-center relative">
                        {getAlbumCoverPhoto(album) ? (
                          <img
                            src={getAlbumCoverPhoto(album)}
                            alt={album.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Images className="h-12 w-12 text-muted-foreground" />
                        )}
                        
                        {/* Album actions dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="right">
                            <DropdownMenuItem onClick={() => handleEditAlbum(album)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Album
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteAlbum(album.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Album
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <CardTitle className="text-lg font-semibold truncate">
                        {album.name}
                      </CardTitle>
                      {album.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {album.description}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="px-4 py-3 pt-0">
                      <p className="text-sm text-muted-foreground">
                        {getPhotoCount(album)} {getPhotoCount(album) === 1 ? 'photo' : 'photos'}
                      </p>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {albums.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-96 text-muted-foreground"
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Images className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium mb-2">No albums yet</h3>
              <p className="text-sm mb-4">Create your first album to organize your photos</p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Album
              </Button>
            </motion.div>
          )}

          {/* Edit Album Modal */}
          <Dialog open={!!editingAlbum} onOpenChange={(open) => !open && setEditingAlbum(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Album</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-album-name">Album Name</Label>
                  <Input
                    id="edit-album-name"
                    placeholder="Enter album name..."
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-album-description">Description (Optional)</Label>
                  <Textarea
                    id="edit-album-description"
                    placeholder="Enter album description..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingAlbum(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateAlbum} disabled={!formData.name.trim()}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </Layout>
  );
};