'use client';

import React from 'react';
import { FileItem as FileItemType } from '@/lib/types';
import { FileItem } from './FileItem';
import { useFileStore } from '@/lib/store/fileStore';
import { useUIStore } from '@/lib/store/uiStore';

interface FileListProps {
  files: FileItemType[];
  onFileOpen?: (file: FileItemType) => void;
}

export const FileList: React.FC<FileListProps> = ({ files, onFileOpen }) => {
  const { selectedFiles, toggleFileSelection } = useFileStore();
  const { openModal } = useUIStore();

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-1 min-w-0">Name</div>
        <div className="w-24 text-right">Owner</div>
        <div className="w-32 text-right">Last modified</div>
        <div className="w-24 text-right">File size</div>
        <div className="w-12"></div>
      </div>

      {/* Files */}
      {files.map((file) => (
        <FileItem
          key={file.id}
          file={file}
          viewMode="list"
          isSelected={selectedFiles.includes(file.id)}
          onSelect={() => toggleFileSelection(file.id)}
          onOpen={() => onFileOpen?.(file)}
          onStar={() => console.log('Star', file.id)}
          onRename={() => openModal('rename', file)}
          onDelete={() => openModal('delete', file)}
          onShare={() => openModal('share', file)}
          onDownload={() => console.log('Download', file.id)}
        />
      ))}
    </div>
  );
};