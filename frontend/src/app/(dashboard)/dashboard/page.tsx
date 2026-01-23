'use client';

import React, { useEffect, useState } from 'react';
import { Breadcrumb } from '@/components/dashboard/Breadcrumb';
import { FileGrid } from '@/components/dashboard/FileGrid';
import { filesApi } from '@/lib/api/files';
import { foldersApi } from '@/lib/api/folders';
import { FileItem } from '@/lib/types';
import { useFileStore } from '@/lib/store/fileStore';
import { FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/lib/store/uiStore';
import { UploadButton } from '@/components/dashboard/UploadButton';

export default function DashboardPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const { setFiles: setStoreFiles, setCurrentFolder, refreshTrigger } = useFileStore();
  const { openModal } = useUIStore();

  // Load files when folder changes
  useEffect(() => {
    loadFiles();
  }, [currentFolderId]);

  // Load files when refresh is triggered
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('🔄 Dashboard: Refresh triggered, count:', refreshTrigger);
      loadFiles();
    }
  }, [refreshTrigger]);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      console.log('📁 Dashboard: Loading files for folder:', currentFolderId || 'root');
      // Get folder contents (includes both folders and files)
      const items = await foldersApi.getFolderContents(currentFolderId);
      
      console.log('✅ Dashboard: Loaded', items.length, 'items');
      setFiles(items);
      setStoreFiles(items);
    } catch (error) {
      console.error('❌ Dashboard: Failed to load files:', error);
      setFiles([]);
      setStoreFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileOpen = async (file: FileItem) => {
    if (file.type === 'folder') {
      // Navigate into folder
      setCurrentFolderId(file.id);
      setCurrentFolder(file);
    } else {
      // Download file
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
        console.error('Failed to download file:', error);
        alert('Failed to download file');
      }
    }
  };

  const handleStar = async (file: FileItem) => {
    try {
      await filesApi.toggleStar(file.id);
      // Refresh list
      loadFiles();
    } catch (error) {
      console.error('Failed to toggle star:', error);
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
      console.error('Failed to download file:', error);
      alert('Failed to download file');
    }
  };

  // Called after any successful operation
  const handleOperationSuccess = () => {
    console.log('✨ Dashboard: Operation success, reloading files');
    loadFiles();
  };

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