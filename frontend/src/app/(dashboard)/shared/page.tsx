'use client';

import React, { useEffect, useState } from 'react';
import { FileGrid } from '@/components/dashboard/FileGrid';
import { Topbar } from '@/components/dashboard/Topbar';
import { FileItem } from '@/lib/types';
import { sharesApi } from '@/lib/api/shares';
import { filesApi } from '@/lib/api/files';
import { Users, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SharedWithMePage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadSharedFiles();
  }, []);

  const loadSharedFiles = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await sharesApi.getSharedWithMe();
      setFiles(data.files || []);
    } catch (err: any) {
      console.error('Failed to load shared files:', err);
      setError(err.message || 'Failed to load shared files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileOpen = async (file: FileItem) => {
    if (file.type === 'folder') {
      // Navigate to folder view inside dashboard
      router.push(`/dashboard/folder/${file.id}`);
    } else {
      // Download the file using the existing API
      handleDownload(file);
    }
  };

  const handleDownload = async (file: FileItem) => {
    try {
      // Use filesApi to get the signed URL
      const blob = await filesApi.downloadFile(file.id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Failed to download:', err);
      alert(err.message || 'Failed to download file. Please try again.');
    }
  };

  const handleStar = async (file: FileItem) => {
  try {
    await filesApi.toggleStar(file.id);
    await loadSharedFiles(); // Refresh to update star status
  } catch (err) {
    console.error('Failed to toggle star:', err);
  }
};
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Topbar />
      
      <main className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Shared with me
            </h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Files and folders others have shared with you
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                Error loading shared files
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
              <button
                onClick={loadSharedFiles}
                className="text-sm text-red-700 dark:text-red-300 underline mt-2 hover:text-red-800 dark:hover:text-red-200"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Files Grid */}
        <FileGrid
          files={files}
          isLoading={isLoading}
          onFileOpen={handleFileOpen}
          onDownload={handleDownload}
          onStar={handleStar}
          onOperationSuccess={loadSharedFiles}
        />

        {/* Empty state */}
        {!isLoading && files.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No shared files yet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
              Files and folders that others share with you will appear here.
              Ask someone to share a file with your email address.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}