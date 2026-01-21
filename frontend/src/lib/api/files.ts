import apiClient, { handleApiError } from './client';
import { FileItem, File } from '../types';

export const filesApi = {
  // Get all files in a folder
  getFiles: async (folderId?: string | null): Promise<FileItem[]> => {
    try {
      const params = folderId ? { parentId: folderId } : {};
      const response = await apiClient.get<{ files: FileItem[] }>('/files', { params });
      return response.data.files;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get file by ID
  getFileById: async (fileId: string): Promise<FileItem> => {
    try {
      const response = await apiClient.get<{ file: FileItem }>(`/files/${fileId}`);
      return response.data.file;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Upload file
  uploadFile: async (
    file: globalThis.File, 
    folderId?: string | null,
    onProgress?: (progress: number) => void
  ): Promise<FileItem> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folderId) {
        formData.append('parentId', folderId);
      }

      const response = await apiClient.post<{ file: FileItem }>('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress?.(progress);
          }
        },
      });

      return response.data.file;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete file
  deleteFile: async (fileId: string): Promise<void> => {
    try {
      await apiClient.delete(`/files/${fileId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Rename file
  renameFile: async (fileId: string, newName: string): Promise<FileItem> => {
    try {
      const response = await apiClient.patch<{ file: FileItem }>(`/files/${fileId}`, {
        name: newName,
      });
      return response.data.file;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Move file
  moveFile: async (fileId: string, newParentId: string | null): Promise<FileItem> => {
    try {
      const response = await apiClient.patch<{ file: FileItem }>(`/files/${fileId}/move`, {
        parentId: newParentId,
      });
      return response.data.file;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Star/unstar file
  toggleStar: async (fileId: string): Promise<FileItem> => {
    try {
      const response = await apiClient.post<{ file: FileItem }>(`/files/${fileId}/star`);
      return response.data.file;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get starred files
  getStarredFiles: async (): Promise<FileItem[]> => {
    try {
      const response = await apiClient.get<{ files: FileItem[] }>('/files/starred');
      return response.data.files;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get recent files
  getRecentFiles: async (): Promise<FileItem[]> => {
    try {
      const response = await apiClient.get<{ files: FileItem[] }>('/files/recent');
      return response.data.files;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get trashed files
  getTrashedFiles: async (): Promise<FileItem[]> => {
    try {
      const response = await apiClient.get<{ files: FileItem[] }>('/files/trash');
      return response.data.files;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Move to trash
  moveToTrash: async (fileId: string): Promise<void> => {
    try {
      await apiClient.post(`/files/${fileId}/trash`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Restore from trash
  restoreFromTrash: async (fileId: string): Promise<FileItem> => {
    try {
      const response = await apiClient.post<{ file: FileItem }>(`/files/${fileId}/restore`);
      return response.data.file;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Search files
  searchFiles: async (query: string): Promise<FileItem[]> => {
    try {
      const response = await apiClient.get<{ files: FileItem[] }>('/files/search', {
        params: { q: query },
      });
      return response.data.files;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Download file
    // Download file
  downloadFile: async (fileId: string): Promise<Blob> => {
    try {
      const response = await apiClient.get<{ url: string }>(`/files/${fileId}/download`);
      const fileResponse = await fetch(response.data.url);
      return await fileResponse.blob();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default filesApi;
