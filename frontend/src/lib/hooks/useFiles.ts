import { useState, useEffect } from 'react';
import { filesApi } from '../api/files';
import { FileItem } from '../types';

export const useFiles = (folderId?: string | null) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, [folderId]);

  const loadFiles = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await filesApi.getFiles(folderId);
      setFiles(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    loadFiles();
  };

  return {
    files,
    isLoading,
    error,
    refetch,
  };
};