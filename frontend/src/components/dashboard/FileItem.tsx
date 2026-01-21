'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Folder,
  FileText,
  Image,
  Video,
  Music,
  File,
  MoreVertical,
  Star,
  Download,
  Trash2,
  Edit,
  Share2,
} from 'lucide-react';
import { FileItem as FileItemType } from '@/lib/types';
import { formatFileSize, formatDate } from '@/lib/utils/formatters';
import clsx from 'clsx';

interface FileItemProps {
  file: FileItemType;
  viewMode: 'grid' | 'list';
  isSelected?: boolean;
  onSelect?: () => void;
  onOpen?: () => void;
  onStar?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
}

const getFileIcon = (file: FileItemType) => {
  if (file.type === 'folder') return Folder;
  if (file.mimeType?.startsWith('image/')) return Image;
  if (file.mimeType?.startsWith('video/')) return Video;
  if (file.mimeType?.startsWith('audio/')) return Music;
  if (file.mimeType?.includes('pdf')) return FileText;
  return File;
};

export const FileItem: React.FC<FileItemProps> = ({
  file,
  viewMode,
  isSelected,
  onSelect,
  onOpen,
  onStar,
  onRename,
  onDelete,
  onShare,
  onDownload,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const Icon = getFileIcon(file);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMenu(true);
  };

  if (viewMode === 'grid') {
    return (
      <div
        className={clsx(
          'group relative p-4 rounded-lg border-2 transition-all cursor-pointer',
          isSelected
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
        )}
        onClick={onOpen}
        onContextMenu={handleContextMenu}
      >
        <div className="flex flex-col items-center text-center space-y-2">
          <div
            className={clsx(
              'w-16 h-16 rounded-lg flex items-center justify-center',
              file.type === 'folder'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            )}
          >
            <Icon className="w-8 h-8" />
          </div>

          <div className="w-full">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {file.name}
            </p>
            {file.type === 'file' && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(file.size)}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {file.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Context Menu */}
        {showMenu && (
          <div
            ref={menuRef}
            className="absolute right-2 top-10 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStar?.();
                setShowMenu(false);
              }}
              className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Star className="w-4 h-4" />
              <span>{file.isStarred ? 'Unstar' : 'Star'}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare?.();
                setShowMenu(false);
              }}
              className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            {file.type === 'file' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload?.();
                  setShowMenu(false);
                }}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRename?.();
                setShowMenu(false);
              }}
              className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Edit className="w-4 h-4" />
              <span>Rename</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
                setShowMenu(false);
              }}
              className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // List view
  return (
    <div
      className={clsx(
        'group flex items-center px-4 py-3 rounded-lg border transition-all cursor-pointer',
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
      )}
      onClick={onOpen}
      onContextMenu={handleContextMenu}
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div
          className={clsx(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
            file.type === 'folder'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {file.name}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
        <span className="w-20 text-right">{file.type === 'file' ? formatFileSize(file.size) : '--'}</span>
        <span className="w-24 text-right">{formatDate(file.updatedAt)}</span>
        <div className="flex items-center space-x-2">
          {file.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Context Menu (same as grid) */}
      {showMenu && (
        <div
          ref={menuRef}
          className="absolute right-4 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
          style={{ top: 'auto' }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStar?.();
              setShowMenu(false);
            }}
            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Star className="w-4 h-4" />
            <span>{file.isStarred ? 'Unstar' : 'Star'}</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare?.();
              setShowMenu(false);
            }}
            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
          {file.type === 'file' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownload?.();
                setShowMenu(false);
              }}
              className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRename?.();
              setShowMenu(false);
            }}
            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Edit className="w-4 h-4" />
            <span>Rename</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
              setShowMenu(false);
            }}
            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};