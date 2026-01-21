'use client';

import React from 'react';
import { FileItem } from './FileItem';
import { FileItem as FileItemType } from '@/lib/types';
import { useFileStore } from '@/lib/store/fileStore';
import { useUIStore } from '@/lib/store/uiStore';
import { Spinner } from '@/components/ui/Spinner';

interface FileGridProps {
  files: FileItemType[];
  isLoading?: boolean;
  onFileOpen?: (file: FileItemType) => void;
  onStar?: (file: FileItemType) => void;
  onDownload?: (file: FileItemType) => void;
  onOperationSuccess?: () => void;
}

export const FileGrid: React.FC<FileGridProps> = ({ 
  files, 
  isLoading, 
  onFileOpen,
  onStar,
  onDownload,
  onOperationSuccess,
}) => {
  const { selectedFiles, toggleFileSelection, viewMode } = useFileStore();
  const { openModal } = useUIStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <p className="text-lg">No files or folders</p>
        <p className="text-sm mt-2">Upload files or create folders to get started</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-1">
        {files.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            viewMode="list"
            isSelected={selectedFiles.includes(file.id)}
            onSelect={() => toggleFileSelection(file.id)}
            onOpen={() => onFileOpen?.(file)}
            onStar={() => onStar?.(file)}
            onRename={() => {
              openModal('rename', file);
              // Store callback for after rename
              (window as any).__operationSuccessCallback = onOperationSuccess;
            }}
            onDelete={() => {
              openModal('delete', file);
              // Store callback for after delete
              (window as any).__operationSuccessCallback = onOperationSuccess;
            }}
            onShare={() => openModal('share', file)}
            onDownload={() => onDownload?.(file)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {files.map((file) => (
        <FileItem
          key={file.id}
          file={file}
          viewMode="grid"
          isSelected={selectedFiles.includes(file.id)}
          onSelect={() => toggleFileSelection(file.id)}
          onOpen={() => onFileOpen?.(file)}
          onStar={() => onStar?.(file)}
          onRename={() => {
            openModal('rename', file);
            (window as any).__operationSuccessCallback = onOperationSuccess;
          }}
          onDelete={() => {
            openModal('delete', file);
            (window as any).__operationSuccessCallback = onOperationSuccess;
          }}
          onShare={() => openModal('share', file)}
          onDownload={() => onDownload?.(file)}
        />
      ))}
    </div>
  );
};