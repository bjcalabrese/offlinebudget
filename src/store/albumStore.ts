import { create } from 'zustand';
import { Album, AlbumSortBy, SortDirection } from '@/types/album';

interface AlbumStore {
  // State
  albums: Album[];
  selectedAlbum: Album | null;
  sortBy: AlbumSortBy;
  sortDirection: SortDirection;
  loading: boolean;
  
  // Actions
  setAlbums: (albums: Album[]) => void;
  addAlbum: (album: Album) => void;
  updateAlbum: (id: string, updates: Partial<Album>) => void;
  deleteAlbum: (id: string) => void;
  
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
  setAlbums: (albums) => set({ albums }),
  
  addAlbum: (album) => set((state) => ({
    albums: [...state.albums, album]
  })),
  
  updateAlbum: (id, updates) => set((state) => ({
    albums: state.albums.map(album => 
      album.id === id ? { ...album, ...updates } : album
    ),
    selectedAlbum: state.selectedAlbum?.id === id 
      ? { ...state.selectedAlbum, ...updates } 
      : state.selectedAlbum
  })),
  
  deleteAlbum: (id) => set((state) => ({
    albums: state.albums.filter(album => album.id !== id),
    selectedAlbum: state.selectedAlbum?.id === id ? null : state.selectedAlbum
  })),
  
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