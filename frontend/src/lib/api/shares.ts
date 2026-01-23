import { API_BASE_URL } from './config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const sharesApi = {
  // Share file via email
  shareViaEmail: async (fileId: string, email: string, message?: string) => {
    const response = await fetch(`${API_BASE_URL}/shares/email`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ fileId, email, message }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to share file');
    }

    return response.json();
  },

  // Get files shared with me - NEW
  getSharedWithMe: async () => {
    const response = await fetch(`${API_BASE_URL}/shares/shared-with-me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to load shared files');
    }

    return response.json();
  },

  // Get share by ID - NEW
  getShareById: async (shareId: string) => {
    const response = await fetch(`${API_BASE_URL}/shares/${shareId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to load share');
    }

    return response.json();
  },

  // Accept/claim a share - NEW
  acceptShare: async (shareId: string) => {
    const response = await fetch(`${API_BASE_URL}/shares/${shareId}/accept`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to accept share');
    }

    return response.json();
  },

  // Get shares for a specific file
  getFileShares: async (fileId: string) => {
    const response = await fetch(`${API_BASE_URL}/shares/file/${fileId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to load shares');
    }

    const data = await response.json();
    return data.shares || [];
  },

  // Remove a share
  removeShare: async (shareId: string) => {
    const response = await fetch(`${API_BASE_URL}/shares/${shareId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to remove share');
    }

    return response.json();
  },
};