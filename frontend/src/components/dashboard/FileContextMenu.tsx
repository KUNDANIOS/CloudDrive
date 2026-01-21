'use client';

import React, { useEffect, useRef } from 'react';
import { Star, Share2, Download, Edit, Trash2, Move } from 'lucide-react';
import { FileItem } from '@/lib/types';

interface FileContextMenuProps {
  file: FileItem;
  position: { x: number; y: number };
  onClose: () => void;
  onStar?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  onRename?: () => void;
  onMove?: () => void;
  onDelete?: () => void;
}

export const FileContextMenu: React.FC<FileContextMenuProps> = ({
  file,
  position,
  onClose,
  onStar,
  onShare,
  onDownload,
  onRename,
  onMove,
  onDelete,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50"
      style={{ top: position.y, left: position.x }}
    >
      <button
        onClick={() => {
          onStar?.();
          onClose();
        }}
        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Star className="w-4 h-4" />
        <span>{file.isStarred ? 'Remove from starred' : 'Add to starred'}</span>
      </button>

      <button
        onClick={() => {
          onShare?.();
          onClose();
        }}
        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </button>

      {file.type === 'file' && (
        <button
          onClick={() => {
            onDownload?.();
            onClose();
          }}
          className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </button>
      )}

      <div className="my-1 border-t border-gray-200 dark:border-gray-700" />

      <button
        onClick={() => {
          onRename?.();
          onClose();
        }}
        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Edit className="w-4 h-4" />
        <span>Rename</span>
      </button>

      <button
        onClick={() => {
          onMove?.();
          onClose();
        }}
        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Move className="w-4 h-4" />
        <span>Move to</span>
      </button>

      <div className="my-1 border-t border-gray-200 dark:border-gray-700" />

      <button
        onClick={() => {
          onDelete?.();
          onClose();
        }}
        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        <span>Move to trash</span>
      </button>
    </div>
  );
};