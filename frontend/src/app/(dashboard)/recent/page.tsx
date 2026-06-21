'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { FileGrid } from '@/components/dashboard/FileGrid';
import { filesApi } from '@/lib/api/files';
import { FileItem } from '@/lib/types';
import { Clock } from 'lucide-react';
import { useFileStore } from '@/lib/store/fileStore';

export default function RecentPage() {
  const [localFiles, setLocalFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { searchQuery } = useFileStore();

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return localFiles;
    const q = searchQuery.toLowerCase().trim();
    return localFiles.filter((f) => f.name.toLowerCase().includes(q));
  }, [localFiles, searchQuery]);

  useEffect(() => {
    loadRecentFiles();
  }, []);

  const loadRecentFiles = async () => {
    setIsLoading(true);
    try {
      const data = await filesApi.getRecentFiles();
      setLocalFiles(data);
    } catch (error) {
      console.error('Failed to load recent files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileOpen = (file: FileItem) => {
    console.log('Open file:', file.id);
  };

  const handleStar = async (file: FileItem) => {
    try {
      await filesApi.toggleStar(file.id);
      await loadRecentFiles(); // refresh to show updated star
    } catch (error) {
      console.error('Failed to toggle star:', error);
    }
  };

  const handleDownload = async (file: FileItem) => {
    try {
      const blob = await filesApi.downloadFile(file.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Clock className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recent Files
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Files you've recently accessed
          </p>
        </div>
      </div>

      <FileGrid
        files={filteredFiles}
        isLoading={isLoading}
        onFileOpen={handleFileOpen}
        onStar={handleStar}
        onDownload={handleDownload}
        onOperationSuccess={loadRecentFiles}
      />
    </div>
  );
}