import apiClient, { handleApiError } from './client';

export const sharesApi = {
  // Share file via email
  shareViaEmail: async (fileId: string, email: string, message?: string) => {
    try {
      const response = await apiClient.post('/shares/email', {
        fileId,
        email,
        message,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get shares for a file
  getFileShares: async (fileId: string) => {
    try {
      const response = await apiClient.get(`/shares/file/${fileId}`);
      return response.data.shares;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Remove share
  removeShare: async (shareId: string) => {
    try {
      await apiClient.delete(`/shares/${shareId}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};