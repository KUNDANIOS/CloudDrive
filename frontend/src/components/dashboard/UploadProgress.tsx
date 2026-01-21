'use client';

import React from 'react';
import { useFileStore } from '@/lib/store/fileStore';
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { formatFileSize } from '@/lib/utils/formatters';

export const UploadProgress: React.FC = () => {
  const { uploads, removeUpload } = useFileStore();

  if (uploads.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 overflow-y-auto space-y-2 z-50">
      {uploads.map((upload) => (
        <div
          key={upload.fileId}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {upload.fileName}
              </p>
              {upload.status === 'error' && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {upload.error}
                </p>
              )}
            </div>
            <button
              onClick={() => removeUpload(upload.fileId)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          {upload.status === 'uploading' && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Uploading...
                </span>
                <span>{upload.progress}%</span>
              </div>
            </div>
          )}

          {upload.status === 'completed' && (
            <div className="flex items-center text-xs text-green-600 dark:text-green-400">
              <CheckCircle className="w-3 h-3 mr-1" />
              Upload complete
            </div>
          )}

          {upload.status === 'error' && (
            <div className="flex items-center text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-3 h-3 mr-1" />
              Upload failed
            </div>
          )}
        </div>
      ))}
    </div>
  );
};