import { create } from 'zustand';
import { FileState } from '../types';

export const useFileStore = create<FileState>((set) => ({
  files: [],
  currentFolder: null,
  selectedFiles: [],
  viewMode: 'grid',
  isLoading: false,
  breadcrumbs: [{ id: 'root', name: 'My Drive', path: '/' }],
  searchQuery: '',
  uploads: [],

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
    localStorage.setItem('viewMode', mode);
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