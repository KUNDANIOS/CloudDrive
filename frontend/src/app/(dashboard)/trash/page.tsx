'use client';

import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';

import { FileGrid } from '@/components/dashboard/FileGrid';
import { filesApi } from '@/lib/api/files';
import { FileItem } from '@/lib/types';
import { Button } from '@/components/ui/Button';

export default function TrashPage() {
  const [items, setItems] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTrashedItems();
  }, []);

  const loadTrashedItems = async () => {
    try {
      setIsLoading(true);
      // ✅ Use the existing filesApi method
      const trashedItems = await filesApi.getTrashedFiles();
      setItems(trashedItems);
    } catch (error) {
      console.error('Failed to load trashed items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🚫 disable open in trash
  const handleFileOpen = () => {};

  const handleEmptyTrash = async () => {
    if (!confirm('Are you sure you want to permanently delete all items in trash?')) return;

    try {
      await filesApi.emptyTrash();
      setItems([]);
    } catch (error) {
      console.error('Failed to empty trash:', error);
      alert('Failed to empty trash');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

        {items.length > 0 && (
          <Button variant="danger" onClick={handleEmptyTrash}>
            Empty Trash
          </Button>
        )}
      </div>

      {/* Grid */}
      <FileGrid
        files={items}
        isLoading={isLoading}
        onFileOpen={handleFileOpen}
        isTrash
      />
    </div>
  );
}