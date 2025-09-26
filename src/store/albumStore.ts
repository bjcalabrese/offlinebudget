import { create } from 'zustand';
import { Album, AlbumSortBy, SortDirection } from '@/types/album';
import { photoDatabase } from '@/services/database';

interface AlbumStore {
  // State
  albums: Album[];
  selectedAlbum: Album | null;
  sortBy: AlbumSortBy;
  sortDirection: SortDirection;
  loading: boolean;
  
  // Actions
  loadAlbums: () => Promise<void>;
  setAlbums: (albums: Album[]) => void;
  addAlbum: (album: Album) => Promise<void>;
  updateAlbum: (id: string, updates: Partial<Album>) => Promise<void>;
  deleteAlbum: (id: string) => Promise<void>;
  
  setSelectedAlbum: (album: Album | null) => void;
  
  addPhotoToAlbum: (albumId: string, photoId: string) => void;
  removePhotoFromAlbum: (albumId: string, photoId: string) => void;
  addPhotosToAlbum: (albumId: string, photoIds: string[]) => void;
  removePhotosFromAlbum: (albumId: string, photoIds: string[]) => void;
  
  setSorting: (sortBy: AlbumSortBy, direction: SortDirection) => void;
  setLoading: (loading: boolean) => void;
}

export const useAlbumStore = create<AlbumStore>((set, get) => ({
  // Initial state
  albums: [],
  selectedAlbum: null,
  sortBy: 'name',
  sortDirection: 'asc',
  loading: false,
  
  // Actions
  loadAlbums: async () => {
    set({ loading: true });
    try {
      await photoDatabase.init();
      const albums = await photoDatabase.getAllAlbums();
      set({ albums, loading: false });
    } catch (error) {
      console.error('Failed to load albums:', error);
      set({ loading: false });
    }
  },
  
  setAlbums: (albums) => set({ albums }),
  
  addAlbum: async (album) => {
    try {
      await photoDatabase.addAlbum(album);
      set((state) => ({ albums: [...state.albums, album] }));
    } catch (error) {
      console.error('Failed to add album:', error);
      // Still update UI optimistically
      set((state) => ({ albums: [...state.albums, album] }));
    }
  },
  
  updateAlbum: async (id, updates) => {
    try {
      await photoDatabase.updateAlbum(id, updates);
      set((state) => ({
        albums: state.albums.map(album => 
          album.id === id ? { ...album, ...updates } : album
        ),
        selectedAlbum: state.selectedAlbum?.id === id 
          ? { ...state.selectedAlbum, ...updates } 
          : state.selectedAlbum
      }));
    } catch (error) {
      console.error('Failed to update album:', error);
      // Still update UI optimistically
      set((state) => ({
        albums: state.albums.map(album => 
          album.id === id ? { ...album, ...updates } : album
        ),
        selectedAlbum: state.selectedAlbum?.id === id 
          ? { ...state.selectedAlbum, ...updates } 
          : state.selectedAlbum
      }));
    }
  },
  
  deleteAlbum: async (id) => {
    try {
      await photoDatabase.deleteAlbum(id);
      set((state) => ({
        albums: state.albums.filter(album => album.id !== id),
        selectedAlbum: state.selectedAlbum?.id === id ? null : state.selectedAlbum
      }));
    } catch (error) {
      console.error('Failed to delete album:', error);
    }
  },
  
  setSelectedAlbum: (album) => set({ selectedAlbum: album }),
  
  addPhotoToAlbum: (albumId, photoId) => set((state) => ({
    albums: state.albums.map(album => 
      album.id === albumId 
        ? { ...album, photoIds: [...album.photoIds, photoId] }
        : album
    )
  })),
  
  removePhotoFromAlbum: (albumId, photoId) => set((state) => ({
    albums: state.albums.map(album => 
      album.id === albumId 
        ? { ...album, photoIds: album.photoIds.filter(id => id !== photoId) }
        : album
    )
  })),
  
  addPhotosToAlbum: (albumId, photoIds) => set((state) => ({
    albums: state.albums.map(album => 
      album.id === albumId 
        ? { ...album, photoIds: [...album.photoIds, ...photoIds] }
        : album
    )
  })),
  
  removePhotosFromAlbum: (albumId, photoIds) => set((state) => ({
    albums: state.albums.map(album => 
      album.id === albumId 
        ? { ...album, photoIds: album.photoIds.filter(id => !photoIds.includes(id)) }
        : album
    )
  })),
  
  setSorting: (sortBy, direction) => set({ sortBy, sortDirection: direction }),
  
  setLoading: (loading) => set({ loading })
}));