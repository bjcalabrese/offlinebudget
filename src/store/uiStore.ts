import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';

interface UIStore {
  // State
  theme: Theme;
  sidebarCollapsed: boolean;
  isPhotoViewerOpen: boolean;
  isUploadModalOpen: boolean;
  isSelectionMode: boolean;
  showPhotoInfo: boolean;
  
  // Actions
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openPhotoViewer: () => void;
  closePhotoViewer: () => void;
  openUploadModal: () => void;
  closeUploadModal: () => void;
  toggleSelectionMode: () => void;
  setSelectionMode: (enabled: boolean) => void;
  togglePhotoInfo: () => void;
  setShowPhotoInfo: (show: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Initial state
  theme: 'system',
  sidebarCollapsed: false,
  isPhotoViewerOpen: false,
  isUploadModalOpen: false,
  isSelectionMode: false,
  showPhotoInfo: false,
  
  // Actions
  setTheme: (theme) => set({ theme }),
  
  toggleSidebar: () => set((state) => ({ 
    sidebarCollapsed: !state.sidebarCollapsed 
  })),
  
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  openPhotoViewer: () => set({ isPhotoViewerOpen: true }),
  closePhotoViewer: () => set({ isPhotoViewerOpen: false }),
  
  openUploadModal: () => set({ isUploadModalOpen: true }),
  closeUploadModal: () => set({ isUploadModalOpen: false }),
  
  toggleSelectionMode: () => set((state) => ({ 
    isSelectionMode: !state.isSelectionMode 
  })),
  
  setSelectionMode: (enabled) => set({ isSelectionMode: enabled }),
  
  togglePhotoInfo: () => set((state) => ({ 
    showPhotoInfo: !state.showPhotoInfo 
  })),
  
  setShowPhotoInfo: (show) => set({ showPhotoInfo: show })
}));