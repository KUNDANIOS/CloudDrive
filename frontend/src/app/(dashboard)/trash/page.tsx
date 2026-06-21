'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Trash2, RotateCcw, X, Folder, FileText, Image, Video, Music, File } from 'lucide-react';
import { filesApi } from '@/lib/api/files';
import { FileItem } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { formatFileSize, formatDate } from '@/lib/utils/formatters';
import { useFileStore } from '@/lib/store/fileStore';
import { Spinner } from '@/components/ui/Spinner';
import clsx from 'clsx';

const getFileIcon = (file: FileItem) => {
  if (file.type === 'folder') return Folder;
  if (file.mimeType?.startsWith('image/')) return Image;
  if (file.mimeType?.startsWith('video/')) return Video;
  if (file.mimeType?.startsWith('audio/')) return Music;
  if (file.mimeType?.includes('pdf')) return FileText;
  return File;
};

export default function TrashPage() {
  const [items, setItems] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { searchQuery, triggerRefresh } = useFileStore();

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter((f) => f.name.toLowerCase().includes(q));
  }, [items, searchQuery]);

  useEffect(() => {
    loadTrashedItems();
  }, []);

  const loadTrashedItems = async () => {
    try {
      setIsLoading(true);
      const trashedItems = await filesApi.getTrashedFiles();
      setItems(trashedItems);
    } catch (error) {
      console.error('Failed to load trashed items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (file: FileItem) => {
    setActionLoading(file.id);
    try {
      await filesApi.restoreFile(file.id);
      setItems((prev) => prev.filter((f) => f.id !== file.id));
      triggerRefresh(); // update storage indicator
    } catch (error) {
      console.error('Failed to restore:', error);
      alert('Failed to restore item');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteForever = async (file: FileItem) => {
    if (!confirm(`Permanently delete "${file.name}"? This cannot be undone.`)) return;
    setActionLoading(file.id);
    try {
      await filesApi.permanentDelete(file.id);
      setItems((prev) => prev.filter((f) => f.id !== file.id));
      triggerRefresh();
    } catch (error) {
      console.error('Failed to delete permanently:', error);
      alert('Failed to delete item');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEmptyTrash = async () => {
    if (!confirm('Permanently delete ALL items in trash? This cannot be undone.')) return;
    try {
      await filesApi.emptyTrash();
      setItems([]);
      triggerRefresh();
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trash</h1>
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

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500">
          <Trash2 className="w-16 h-16 mb-4 opacity-30" />
          <p className="text-lg font-medium">
            {searchQuery ? `No results for "${searchQuery}"` : 'Trash is empty'}
          </p>
          {!searchQuery && (
            <p className="text-sm mt-1">Items you delete will appear here</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredItems.map((file) => {
            const Icon = getFileIcon(file);
            const isActing = actionLoading === file.id;

            return (
              <div
                key={file.id}
                className={clsx(
                  'group relative p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 transition-all',
                  isActing ? 'opacity-50 pointer-events-none' : 'hover:border-gray-300 hover:shadow-md'
                )}
              >
                {/* File Icon */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={clsx(
                    'w-16 h-16 rounded-lg flex items-center justify-center',
                    file.type === 'folder'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  )}>
                    {isActing ? (
                      <Spinner size="sm" />
                    ) : (
                      <Icon className="w-8 h-8 opacity-60" />
                    )}
                  </div>
                  <div className="w-full">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                      {file.name}
                    </p>
                    {file.type === 'file' && file.size && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    )}
                    {file.updatedAt && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(file.updatedAt)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons — visible on hover */}
                <div className="absolute inset-x-2 bottom-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleRestore(file)}
                    title="Restore"
                    className="flex-1 flex items-center justify-center space-x-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restore</span>
                  </button>
                  <button
                    onClick={() => handleDeleteForever(file)}
                    title="Delete forever"
                    className="flex items-center justify-center p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}