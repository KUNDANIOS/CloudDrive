import { create } from 'zustand';
import { FileState } from '../types';

interface ExtendedFileState extends FileState {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export const useFileStore = create<ExtendedFileState>((set) => ({
  files: [],
  currentFolder: null,
  selectedFiles: [],
  viewMode: (typeof window !== 'undefined' && localStorage.getItem('viewMode') as 'grid' | 'list') || 'grid',
  isLoading: false,
  breadcrumbs: [{ id: 'root', name: 'My Drive', path: '/' }],
  searchQuery: '',
  uploads: [],
  refreshTrigger: 0,

  // Trigger a refresh by incrementing the counter
  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),

  setFiles: (files) => set({ files }),

  setCurrentFolder: (folder) => set({ currentFolder: folder }),

  setSelectedFiles: (ids) => set({ selectedFiles: ids }),

  toggleFileSelection: (id) =>
    set((state) => ({
      selectedFiles: state.selectedFiles.includes(id)
        ? state.selectedFiles.filter((fileId) => fileId !== id)
        : [...state.selectedFiles, id],
    })),

  setViewMode: (mode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('viewMode', mode);
    }
    set({ viewMode: mode });
  },

  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  addUpload: (upload) =>
    set((state) => ({
      uploads: [...state.uploads, upload],
    })),

  updateUpload: (fileId, update) =>
    set((state) => ({
      uploads: state.uploads.map((upload) =>
        upload.fileId === fileId ? { ...upload, ...update } : upload
      ),
    })),

  removeUpload: (fileId) =>
    set((state) => ({
      uploads: state.uploads.filter((upload) => upload.fileId !== fileId),
    })),
}));