'use client';

import React, { useEffect, useState } from 'react';
import { FileGrid } from '@/components/dashboard/FileGrid';
import { filesApi } from '@/lib/api/files';
import { FileItem } from '@/lib/types';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function TrashPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTrashedFiles();
  }, []);

  const loadTrashedFiles = async () => {
    setIsLoading(true);
    try {
      const data = await filesApi.getTrashedFiles();
      setFiles(data);
    } catch (error) {
      console.error('Failed to load trashed files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileOpen = (file: FileItem) => {
    console.log('Open file:', file.id);
  };

  const handleEmptyTrash = async () => {
    if (confirm('Are you sure you want to permanently delete all files in trash?')) {
      console.log('Empty trash');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Trash
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Items will be deleted forever after 30 days
            </p>
          </div>
        </div>
        {files.length > 0 && (
          <Button variant="danger" onClick={handleEmptyTrash}>
            Empty Trash
          </Button>
        )}
      </div>

      <FileGrid files={files} isLoading={isLoading} onFileOpen={handleFileOpen} />
    </div>
  );
}