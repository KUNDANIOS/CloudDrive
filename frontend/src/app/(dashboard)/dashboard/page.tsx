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
  const { setFiles: setStoreFiles, setCurrentFolder } = useFileStore();
  const { openModal } = useUIStore();

  useEffect(() => {
    loadFiles();
  }, [currentFolderId]);

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      // Get folder contents (includes both folders and files)
      const items = await foldersApi.getFolderContents(currentFolderId);
      
      setFiles(items);
      setStoreFiles(items);
    } catch (error) {
      console.error('Failed to load files:', error);
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
    loadFiles();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
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