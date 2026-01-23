'use client';

import React, { useEffect, useState } from 'react';
import { FileGrid } from '@/components/dashboard/FileGrid';
import { FileList } from '@/components/dashboard/FileList';
import { Breadcrumb } from '@/components/dashboard/Breadcrumb';
import { QuickAccessApps } from '@/components/dashboard/QuickAccessApps';
import { useFileStore } from '@/lib/store/fileStore';
import { foldersApi } from '@/lib/api/folders';
import { FileItem } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function MyDrivePage() {
  const { 
    files, 
    setFiles, 
    viewMode, 
    currentFolder, 
    setCurrentFolder,
    refreshTrigger 
  } = useFileStore();
  const [isLoading, setIsLoading] = useState(true);

  // Load folder contents
  const loadFolderContents = async (folderId?: string | null) => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading folder contents for:', folderId || 'root');
      const contents = await foldersApi.getFolderContents(folderId);
      console.log('✅ Loaded', contents.length, 'items');
      setFiles(contents);
    } catch (error) {
      console.error('❌ Failed to load folder contents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    console.log('🎯 Initial load for folder:', currentFolder?.id);
    loadFolderContents(currentFolder?.id);
  }, [currentFolder?.id]);

  // Watch for refresh trigger
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('🔄 Refresh triggered, count:', refreshTrigger);
      loadFolderContents(currentFolder?.id);
    }
  }, [refreshTrigger]);

  const handleFileOpen = (file: FileItem) => {
    if (file.type === 'folder') {
      setCurrentFolder({
        id: file.id,
        name: file.name,
        type: 'folder',
        parentId: file.parentId,
        path: file.path,
        isStarred: file.isStarred,
        isTrashed: file.isTrashed,
        owner: file.owner,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
      });
    } else {
      // Handle file opening (download, preview, etc.)
      console.log('📂 Opening file:', file.name);
    }
  };

  const handleRefresh = () => {
    loadFolderContents(currentFolder?.id);
  };

  if (isLoading && files.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Access Apps - Only show on root */}
      {!currentFolder && <QuickAccessApps appName="My Drive" />}

      {/* Breadcrumb */}
      <Breadcrumb />

      {/* File Display */}
      {viewMode === 'grid' ? (
        <FileGrid 
          files={files} 
          isLoading={isLoading} 
          onFileOpen={handleFileOpen}
        />
      ) : (
        <FileList 
          files={files} 
          onFileOpen={handleFileOpen}
        />
      )}

      {/* Empty State */}
      {!isLoading && files.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No files or folders yet. Create a new folder to get started!
          </p>
        </div>
      )}
    </div>
  );
}