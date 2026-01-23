'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Breadcrumb } from '@/components/dashboard/Breadcrumb';
import { FileGrid } from '@/components/dashboard/FileGrid';
import { filesApi } from '@/lib/api/files';
import { foldersApi } from '@/lib/api/folders';
import { FileItem } from '@/lib/types';
import { useFileStore } from '@/lib/store/fileStore';
import { FolderPlus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/lib/store/uiStore';
import { UploadButton } from '@/components/dashboard/UploadButton';

export default function DashboardPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const { setFiles: setStoreFiles, setCurrentFolder, refreshTrigger } = useFileStore();
  const { openModal } = useUIStore();

  // Memoized load files function
  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📁 Dashboard: Loading files for folder:', currentFolderId || 'root');
      const items = await foldersApi.getFolderContents(currentFolderId);
      
      console.log('✅ Dashboard: Loaded', items.length, 'items');
      setFiles(items);
      setStoreFiles(items);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load files';
      console.error('❌ Dashboard: Failed to load files:', error);
      setError(errorMessage);
      setFiles([]);
      setStoreFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentFolderId, setStoreFiles]);

  // Load files when folder changes
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Load files when refresh is triggered
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('🔄 Dashboard: Refresh triggered, count:', refreshTrigger);
      loadFiles();
    }
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
        const errorMessage = error instanceof Error ? error.message : 'Failed to download file';
        console.error('Failed to download file:', error);
        setError(errorMessage);
      }
    }
  };

  const handleStar = async (file: FileItem) => {
    try {
      await filesApi.toggleStar(file.id);
      await loadFiles();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle star';
      console.error('Failed to toggle star:', error);
      setError(errorMessage);
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to download file';
      console.error('Failed to download file:', error);
      setError(errorMessage);
    }
  };

  const handleOperationSuccess = useCallback(() => {
    console.log('✨ Dashboard: Operation success, reloading files');
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
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Error
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              {error}
            </p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 text-lg leading-none"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {/* Files Grid */}
      <FileGrid 
        files={files} 
        isLoading={isLoading} 
        onFileOpen={handleFileOpen}
        onStar={handleStar}
        onDownload={handleDownload}
        onOperationSuccess={handleOperationSuccess}
      />
    </div>
  );
}