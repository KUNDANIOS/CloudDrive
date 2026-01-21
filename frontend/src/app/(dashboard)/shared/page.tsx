'use client';

import React, { useState } from 'react';
import { FileGrid } from '@/components/dashboard/FileGrid';
import { FileItem } from '@/lib/types';
import { Users } from 'lucide-react';

export default function SharedPage() {
  const [files] = useState<FileItem[]>([]);

  const handleFileOpen = (file: FileItem) => {
    console.log('Open file:', file.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
          <Users className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Shared with me
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Files others have shared with you
          </p>
        </div>
      </div>

      <FileGrid files={files} isLoading={false} onFileOpen={handleFileOpen} />
    </div>
  );
}