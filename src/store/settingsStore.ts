import { create } from 'zustand';
import { AppSettings, Tag, SavedSearch } from '@/types/settings';
import { photoDatabase } from '@/services/database';

interface SettingsStore {
  // State
  settings: AppSettings;
  tags: Tag[];
  savedSearches: SavedSearch[];
  loading: boolean;
  
  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  
  // Tags
  loadTags: () => Promise<void>;
  addTag: (tag: Omit<Tag, 'id' | 'createdAt'>) => Promise<void>;
  updateTag: (id: string, updates: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  
  // Saved searches
  loadSavedSearches: () => Promise<void>;
  addSavedSearch: (search: Omit<SavedSearch, 'id' | 'createdAt' | 'lastUsed'>) => Promise<void>;
  updateSavedSearch: (id: string, updates: Partial<SavedSearch>) => Promise<void>;
  deleteSavedSearch: (id: string) => Promise<void>;
}

const defaultSettings: AppSettings = {
  display: {
    theme: 'auto',
    gridDensity: 'comfortable',
    thumbnailQuality: 'medium',
    animationSpeed: 1,
    language: 'en',
    highContrast: false,
    reducedMotion: false,
  },
  storage: {
    maxCacheSize: 1000, // 1GB
    autoCleanup: true,
    compressionLevel: 80,
    backgroundSync: true,
    memoryUsageLimit: 500, // 500MB
  },
  upload: {
    autoCreateByDate: false,
    autoCreateByLocation: false,
    compressionQuality: 85,
    generateMultipleSizes: true,
    autoTagByFilename: false,
    duplicateDetection: true,
  },
  privacy: {
    stripMetadata: false,
    keepLocationData: true,
    enableAnalytics: false,
  },
  search: {
    searchHistoryLength: 50,
    enableAutoTagging: true,
    dateFormat: 'MM/dd/yyyy',
    sortOrderDefault: 'newest',
  },
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
      // Initial state
      settings: defaultSettings,
      tags: [],
      savedSearches: [],
      loading: false,

      // Actions
      loadSettings: async () => {
        set({ loading: true });
        try {
          await photoDatabase.init();
          const savedSettings = await photoDatabase.getSetting('appSettings');
          if (savedSettings) {
            set({ settings: { ...defaultSettings, ...savedSettings } });
          }
        } catch (error) {
          console.error('Failed to load settings:', error);
        } finally {
          set({ loading: false });
        }
      },

      updateSettings: async (updates) => {
        const currentSettings = get().settings;
        const newSettings = {
          ...currentSettings,
          ...updates,
          // Deep merge nested objects
          display: { ...currentSettings.display, ...(updates.display || {}) },
          storage: { ...currentSettings.storage, ...(updates.storage || {}) },
          upload: { ...currentSettings.upload, ...(updates.upload || {}) },
          privacy: { ...currentSettings.privacy, ...(updates.privacy || {}) },
          search: { ...currentSettings.search, ...(updates.search || {}) },
        };

        set({ settings: newSettings });
        
        try {
          await photoDatabase.setSetting('appSettings', newSettings);
        } catch (error) {
          console.error('Failed to save settings:', error);
        }
      },

      resetSettings: async () => {
        set({ settings: defaultSettings });
        try {
          await photoDatabase.setSetting('appSettings', defaultSettings);
        } catch (error) {
          console.error('Failed to reset settings:', error);
        }
      },

      // Tags
      loadTags: async () => {
        try {
          const tags = await photoDatabase.getAllTags();
          set({ tags });
        } catch (error) {
          console.error('Failed to load tags:', error);
        }
      },

      addTag: async (tagData) => {
        const newTag: Tag = {
          ...tagData,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
        };

        try {
          await photoDatabase.addTag(newTag);
          set((state) => ({ tags: [...state.tags, newTag] }));
        } catch (error) {
          console.error('Failed to add tag:', error);
        }
      },

      updateTag: async (id, updates) => {
        try {
          const currentTags = get().tags;
          const updatedTags = currentTags.map(tag =>
            tag.id === id ? { ...tag, ...updates } : tag
          );
          
          const updatedTag = updatedTags.find(tag => tag.id === id);
          if (updatedTag) {
            await photoDatabase.addTag(updatedTag); // PUT operation
            set({ tags: updatedTags });
          }
        } catch (error) {
          console.error('Failed to update tag:', error);
        }
      },

      deleteTag: async (id) => {
        try {
          // Note: In a real implementation, you'd also need to remove the tag from all photos
          set((state) => ({ tags: state.tags.filter(tag => tag.id !== id) }));
        } catch (error) {
          console.error('Failed to delete tag:', error);
        }
      },

      // Saved searches
      loadSavedSearches: async () => {
        try {
          // Implementation would load from IndexedDB
          set({ savedSearches: [] }); // Placeholder
        } catch (error) {
          console.error('Failed to load saved searches:', error);
        }
      },

      addSavedSearch: async (searchData) => {
        const newSearch: SavedSearch = {
          ...searchData,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          lastUsed: new Date(),
        };

        try {
          // Implementation would save to IndexedDB
          set((state) => ({ savedSearches: [...state.savedSearches, newSearch] }));
        } catch (error) {
          console.error('Failed to add saved search:', error);
        }
      },

      updateSavedSearch: async (id, updates) => {
        try {
          set((state) => ({
            savedSearches: state.savedSearches.map(search =>
              search.id === id ? { ...search, ...updates } : search
            )
          }));
        } catch (error) {
          console.error('Failed to update saved search:', error);
        }
      },

      deleteSavedSearch: async (id) => {
        try {
          set((state) => ({
            savedSearches: state.savedSearches.filter(search => search.id !== id)
          }));
        } catch (error) {
          console.error('Failed to delete saved search:', error);
        }
      },
    }),
  }
));