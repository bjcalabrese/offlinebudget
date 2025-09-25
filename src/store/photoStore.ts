import { create } from 'zustand';
import { Photo, PhotoFilter, ViewMode, GridSize, UploadProgress } from '@/types/photo';

interface PhotoStore {
  // State
  photos: Photo[];
  selectedPhoto: Photo | null;
  selectedPhotos: Set<string>;
  viewMode: ViewMode;
  gridSize: GridSize;
  filter: PhotoFilter;
  uploadProgress: UploadProgress[];
  loading: boolean;
  
  // Actions
  setPhotos: (photos: Photo[]) => void;
  addPhotos: (photos: Photo[]) => void;
  updatePhoto: (id: string, updates: Partial<Photo>) => void;
  deletePhoto: (id: string) => void;
  deletePhotos: (ids: string[]) => void;
  
  setSelectedPhoto: (photo: Photo | null) => void;
  togglePhotoSelection: (id: string) => void;
  selectAllPhotos: () => void;
  clearSelection: () => void;
  
  setViewMode: (mode: ViewMode) => void;
  setGridSize: (size: GridSize) => void;
  setFilter: (filter: Partial<PhotoFilter>) => void;
  clearFilter: () => void;
  
  addUploadProgress: (progress: UploadProgress) => void;
  updateUploadProgress: (id: string, updates: Partial<UploadProgress>) => void;
  removeUploadProgress: (id: string) => void;
  clearUploadProgress: () => void;
  
  setLoading: (loading: boolean) => void;
}

export const usePhotoStore = create<PhotoStore>((set, get) => ({
  // Initial state
  photos: [],
  selectedPhoto: null,
  selectedPhotos: new Set(),
  viewMode: 'grid',
  gridSize: 'medium',
  filter: {},
  uploadProgress: [],
  loading: false,
  
  // Actions
  setPhotos: (photos) => set({ photos }),
  
  addPhotos: (photos) => set((state) => ({
    photos: [...state.photos, ...photos]
  })),
  
  updatePhoto: (id, updates) => set((state) => ({
    photos: state.photos.map(photo => 
      photo.id === id ? { ...photo, ...updates } : photo
    )
  })),
  
  deletePhoto: (id) => set((state) => ({
    photos: state.photos.filter(photo => photo.id !== id),
    selectedPhotos: new Set([...state.selectedPhotos].filter(photoId => photoId !== id)),
    selectedPhoto: state.selectedPhoto?.id === id ? null : state.selectedPhoto
  })),
  
  deletePhotos: (ids) => set((state) => ({
    photos: state.photos.filter(photo => !ids.includes(photo.id)),
    selectedPhotos: new Set([...state.selectedPhotos].filter(photoId => !ids.includes(photoId))),
    selectedPhoto: ids.includes(state.selectedPhoto?.id || '') ? null : state.selectedPhoto
  })),
  
  setSelectedPhoto: (photo) => set({ selectedPhoto: photo }),
  
  togglePhotoSelection: (id) => set((state) => {
    const newSelection = new Set(state.selectedPhotos);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    return { selectedPhotos: newSelection };
  }),
  
  selectAllPhotos: () => set((state) => ({
    selectedPhotos: new Set(state.photos.map(photo => photo.id))
  })),
  
  clearSelection: () => set({ selectedPhotos: new Set() }),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  setGridSize: (size) => set({ gridSize: size }),
  
  setFilter: (filter) => set((state) => ({
    filter: { ...state.filter, ...filter }
  })),
  
  clearFilter: () => set({ filter: {} }),
  
  addUploadProgress: (progress) => set((state) => ({
    uploadProgress: [...state.uploadProgress, progress]
  })),
  
  updateUploadProgress: (id, updates) => set((state) => ({
    uploadProgress: state.uploadProgress.map(progress =>
      progress.id === id ? { ...progress, ...updates } : progress
    )
  })),
  
  removeUploadProgress: (id) => set((state) => ({
    uploadProgress: state.uploadProgress.filter(progress => progress.id !== id)
  })),
  
  clearUploadProgress: () => set({ uploadProgress: [] }),
  
  setLoading: (loading) => set({ loading })
}));