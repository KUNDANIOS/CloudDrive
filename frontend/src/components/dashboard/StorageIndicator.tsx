'use client';

import React, { useEffect, useState } from 'react';
import { HardDrive } from 'lucide-react';
import { filesApi } from '@/lib/api/files';
import { formatFileSize } from '@/lib/utils/formatters';
import clsx from 'clsx';

interface StorageData {
  used: number;
  limit: number;
}

export const StorageIndicator: React.FC = () => {
  const [storage, setStorage] = useState<StorageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStorage();
    
    // Refresh storage every 30 seconds
    const interval = setInterval(loadStorage, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStorage = async () => {
    try {
      const data = await filesApi.getStorageUsage();
      setStorage(data);
    } catch (error) {
      console.error('Failed to load storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <HardDrive className="w-4 h-4" />
              <span>Storage</span>
            </div>
            <span className="text-gray-500">...</span>
          </div>
        </div>
      </div>
    );
  }

  const storagePercent = storage 
    ? Math.min(Math.round((storage.used / storage.limit) * 100), 100)
    : 0;

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <HardDrive className="w-4 h-4" />
            <span>Storage</span>
          </div>
          <span className="text-gray-900 dark:text-white font-medium">
            {storagePercent}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className={clsx(
              'h-2 rounded-full transition-all duration-300',
              storagePercent >= 90
                ? 'bg-red-500'
                : storagePercent >= 75
                ? 'bg-yellow-500'
                : 'bg-blue-500'
            )}
            style={{ width: `${storagePercent}%` }}
          />
        </div>

        {/* Storage Text */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-gray-400">
            {storage ? formatFileSize(storage.used) : '0 B'} used
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            {storage ? formatFileSize(storage.limit) : '5 GB'} total
          </span>
        </div>

        {/* Warning Message */}
        {storagePercent >= 90 && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-xs text-red-600 dark:text-red-400">
              ⚠️ Storage almost full. Consider upgrading your plan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};