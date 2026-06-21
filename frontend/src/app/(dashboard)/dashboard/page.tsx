'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Breadcrumb } from '@/components/dashboard/Breadcrumb';
import { FileGrid } from '@/components/dashboard/FileGrid';
import { filesApi } from '@/lib/api/files';
import { foldersApi } from '@/lib/api/folders';
import { FileItem, Folder } from '@/lib/types';
import { useFileStore } from '@/lib/store/fileStore';
import { FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/lib/store/uiStore';
import { UploadButton } from '@/components/dashboard/UploadButton';

export default function DashboardPage() {
  const [localFiles, setLocalFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const { setCurrentFolder, refreshTrigger, searchQuery } = useFileStore();
  const { openModal } = useUIStore();

  // Filter files locally using searchQuery from store
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return localFiles;
    const q = searchQuery.toLowerCase().trim();
    return localFiles.filter((f) => f.name.toLowerCase().includes(q));
  }, [localFiles, searchQuery]);

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await foldersApi.getFolderContents(currentFolderId);
      setLocalFiles(items);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load files');
      setLocalFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentFolderId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    if (refreshTrigger > 0) loadFiles();
  }, [refreshTrigger, loadFiles]);

  const handleFileOpen = async (file: FileItem) => {
    if (file.type === 'folder') {
      setCurrentFolderId(file.id);
      setCurrentFolder(file as Folder);
    } else {
      try {
        const response = await filesApi.downloadFile(file.id);
        const url = window.URL.createObjectURL(response);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to download file');
      }
    }
  };

  const handleStar = async (file: FileItem) => {
    try {
      await filesApi.toggleStar(file.id);
      await loadFiles();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to toggle star');
    }
  };

  const handleDownload = async (file: FileItem) => {
    if (file.type === 'folder') return;
    try {
      const response = await filesApi.downloadFile(file.id);
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to download file');
    }
  };

  const handleOperationSuccess = useCallback(() => {
    loadFiles();
  }, [loadFiles]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            My Drive
          </h1>
          <Breadcrumb />
        </div>
        <div className="flex items-center space-x-3">
          <UploadButton
            folderId={currentFolderId}
            onUploadComplete={handleOperationSuccess}
          />
          <Button onClick={() => openModal('createFolder')}>
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">✕</button>
        </div>
      )}

      {/* Pass filteredFiles directly — search handled here, not in FileGrid */}
      <FileGrid
        files={filteredFiles}
        isLoading={isLoading}
        onFileOpen={handleFileOpen}
        onStar={handleStar}
        onDownload={handleDownload}
        onOperationSuccess={handleOperationSuccess}
      />
    </div>
  );
}