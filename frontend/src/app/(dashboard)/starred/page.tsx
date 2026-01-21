'use client';

import React, { useEffect, useState } from 'react';
import { FileGrid } from '@/components/dashboard/FileGrid';
import { filesApi } from '@/lib/api/files';
import { FileItem } from '@/lib/types';
import { Star } from 'lucide-react';

export default function StarredPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStarredFiles();
  }, []);

  const loadStarredFiles = async () => {
    setIsLoading(true);
    try {
      const data = await filesApi.getStarredFiles();
      setFiles(data);
    } catch (error) {
      console.error('Failed to load starred files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileOpen = (file: FileItem) => {
    console.log('Open file:', file.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
          <Star className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Starred
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Files and folders you've starred
          </p>
        </div>
      </div>

      <FileGrid files={files} isLoading={isLoading} onFileOpen={handleFileOpen} />
    </div>
  );
}