import apiClient, { handleApiError } from './client';
import { Folder, FileItem } from '../types';

export const foldersApi = {
  // Create folder
  createFolder: async (name: string, parentId?: string | null): Promise<Folder> => {
    try {
      const response = await apiClient.post<{ folder: Folder }>('/folders', {
        name,
        parentId,
      });
      return response.data.folder;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get folder by ID
  getFolderById: async (folderId: string): Promise<Folder> => {
    try {
      const response = await apiClient.get<{ folder: Folder }>(`/folders/${folderId}`);
      return response.data.folder;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get folder contents
  getFolderContents: async (folderId?: string | null): Promise<FileItem[]> => {
    try {
      const endpoint = folderId ? `/folders/${folderId}/contents` : '/folders/root';
      const response = await apiClient.get<{ items: FileItem[] }>(endpoint);
      return response.data.items;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete folder
  deleteFolder: async (folderId: string): Promise<void> => {
    try {
      await apiClient.delete(`/folders/${folderId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Rename folder
  renameFolder: async (folderId: string, newName: string): Promise<Folder> => {
    try {
      const response = await apiClient.patch<{ folder: Folder }>(`/folders/${folderId}`, {
        name: newName,
      });
      return response.data.folder;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Move folder
  moveFolder: async (folderId: string, newParentId: string | null): Promise<Folder> => {
    try {
      const response = await apiClient.patch<{ folder: Folder }>(`/folders/${folderId}/move`, {
        parentId: newParentId,
      });
      return response.data.folder;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default foldersApi;