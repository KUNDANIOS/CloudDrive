import apiClient, { handleApiError } from './client';
import { FileItem } from '../types';

export const filesApi = {
  /*FILE LISTING */

  getFiles: async (folderId?: string | null): Promise<FileItem[]> => {
    try {
      const params = folderId ? { parentId: folderId } : {};
      const response = await apiClient.get<{ files: FileItem[] }>('/files', { params });
      return response.data.files;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getFileById: async (fileId: string): Promise<FileItem> => {
    try {
      const response = await apiClient.get<{ file: FileItem }>(`/files/${fileId}`);
      return response.data.file;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /*UPLOAD*/

  uploadFile: async (
    file: globalThis.File,
    folderId?: string | null,
    onProgress?: (progress: number) => void
  ): Promise<FileItem> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folderId) formData.append('parentId', folderId);

      const response = await apiClient.post<{ file: FileItem }>(
        '/files/upload',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            if (e.total) {
              const progress = Math.round((e.loaded * 100) / e.total);
              onProgress?.(progress);
            }
          },
        }
      );

      return response.data.file;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /*UPDATE / MOVE*/

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

  moveFile: async (fileId: string, newParentId: string | null): Promise<FileItem> => {
    try {
      const response = await apiClient.patch<{ file: FileItem }>(
        `/files/${fileId}/move`,
        { parentId: newParentId }
      );
      return response.data.file;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /*STAR / RECENT*/

  toggleStar: async (fileId: string): Promise<FileItem> => {
    try {
      const response = await apiClient.post<{ file: FileItem }>(`/files/${fileId}/star`);
      return response.data.file;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getStarredFiles: async (): Promise<FileItem[]> => {
    try {
      const response = await apiClient.get<{ files: FileItem[] }>('/files/starred');
      return response.data.files;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getRecentFiles: async (): Promise<FileItem[]> => {
    try {
      const response = await apiClient.get<{ files: FileItem[] }>('/files/recent');
      return response.data.files;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /*TRASH (✔ FULLY FIXED)*/

  // Move file to trash (soft delete)
  moveToTrash: async (fileId: string): Promise<void> => {
    try {
      await apiClient.post(`/files/${fileId}/trash`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get trashed files + folders
  getTrashedFiles: async (): Promise<FileItem[]> => {
    try {
      const response = await apiClient.get<{
        files: FileItem[];
        folders: FileItem[];
      }>('/files/trash');

      return [...response.data.files, ...response.data.folders];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Restore from trash
  restoreFile: async (fileId: string): Promise<void> => {
    try {
      await apiClient.patch(`/files/${fileId}/restore`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete forever (from trash)
  permanentDelete: async (fileId: string): Promise<void> => {
    try {
      await apiClient.delete(`/files/${fileId}/permanent`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Empty entire trash
  emptyTrash: async (): Promise<void> => {
    try {
      await apiClient.delete('/files/trash/empty');
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /*SEARCH / DOWNLOAD*/

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

  downloadFile: async (fileId: string): Promise<Blob> => {
    try {
      const response = await apiClient.get<{ url: string }>(
        `/files/${fileId}/download`
      );
      const fileResponse = await fetch(response.data.url);
      return await fileResponse.blob();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /*SHARING / STORAGE*/

  getSharedFiles: async (): Promise<FileItem[]> => {
    try {
      const response = await apiClient.get<{ files: FileItem[] }>('/files/shared');
      return response.data.files;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  shareFile: async (fileId: string, userEmails: string[]): Promise<void> => {
    try {
      await apiClient.post(`/files/${fileId}/share`, { emails: userEmails });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getFileSharing: async (
    fileId: string
  ): Promise<{ sharedWith: string[] }> => {
    try {
      const response = await apiClient.get<{ sharedWith: string[] }>(
        `/files/${fileId}/sharing`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getStorageUsage: async (): Promise<{ used: number; limit: number }> => {
    try {
      const response = await apiClient.get<{ used: number; limit: number }>(
        '/files/storage'
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default filesApi;
