'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Folder, FileText, Image, Video, Music, File,
  MoreVertical, Star, Download, Trash2, Edit, Share2, X, ZoomIn, ZoomOut,
} from 'lucide-react';
import { FileItem as FileItemType } from '@/lib/types';
import { formatFileSize, formatDate } from '@/lib/utils/formatters';
import { filesApi } from '@/lib/api/files';
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

const isPreviewable = (file: FileItemType) => {
  if (file.type === 'folder') return false;
  return (
    file.mimeType?.startsWith('image/') ||
    file.mimeType?.startsWith('video/') ||
    file.mimeType?.startsWith('audio/') ||
    file.mimeType?.includes('pdf')
  );
};

// ─── Preview Modal ───────────────────────────────────────────────────────────
const FilePreviewModal: React.FC<{
  file: FileItemType;
  onClose: () => void;
  onDownload: () => void;
}> = ({ file, onClose, onDownload }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    let objectUrl: string | null = null;

    const loadPreview = async () => {
      try {
        setIsLoading(true);
        const blob = await filesApi.downloadFile(file.id);
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      } catch {
        setError('Failed to load preview');
      } finally {
        setIsLoading(false);
      }
    };

    loadPreview();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file.id]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (error || !previewUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-400">
          <File className="w-16 h-16 mb-4" />
          <p>{error || 'Preview not available'}</p>
        </div>
      );
    }

    if (file.mimeType?.startsWith('image/')) {
      return (
        <div className="flex items-center justify-center overflow-auto max-h-[70vh]">
          <img
            src={previewUrl}
            alt={file.name}
            style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s' }}
            className="max-w-full object-contain"
          />
        </div>
      );
    }

    if (file.mimeType?.includes('pdf')) {
      return (
        <iframe
          src={previewUrl}
          className="w-full h-[70vh] rounded"
          title={file.name}
        />
      );
    }

    if (file.mimeType?.startsWith('video/')) {
      return (
        <video controls className="w-full max-h-[70vh] rounded" src={previewUrl}>
          Your browser does not support video playback.
        </video>
      );
    }

    if (file.mimeType?.startsWith('audio/')) {
      return (
        <div className="flex flex-col items-center justify-center h-48 space-y-4">
          <Music className="w-16 h-16 text-blue-500" />
          <audio controls src={previewUrl} className="w-full">
            Your browser does not support audio playback.
          </audio>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-400">
        <File className="w-16 h-16 mb-4" />
        <p>Preview not available for this file type</p>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-4xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 min-w-0">
            <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <span className="font-medium text-gray-900 dark:text-white truncate">
              {file.name}
            </span>
            {file.size && (
              <span className="text-sm text-gray-400 flex-shrink-0">
                {formatFileSize(file.size)}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Zoom controls for images */}
            {file.mimeType?.startsWith('image/') && (
              <>
                <button
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-500 w-12 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={onDownload}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-6 overflow-auto">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
};

// ─── FileItem ────────────────────────────────────────────────────────────────
export const FileItem: React.FC<FileItemProps> = ({
  file, viewMode, isSelected, onSelect,
  onOpen, onStar, onRename, onDelete, onShare, onDownload,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
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

  const handleOpen = () => {
    if (file.type === 'folder') {
      onOpen?.();
    } else if (isPreviewable(file)) {
      setShowPreview(true);
    } else {
      // Non-previewable files: download
      onDownload?.();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowMenu(true);
  };

  const contextMenu = (
    <div
      ref={menuRef}
      className="absolute right-2 top-10 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
    >
      <button
        onClick={(e) => { e.stopPropagation(); onStar?.(); setShowMenu(false); }}
        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Star className="w-4 h-4" />
        <span>{file.isStarred ? 'Unstar' : 'Star'}</span>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onShare?.(); setShowMenu(false); }}
        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </button>
      {file.type === 'file' && (
        <button
          onClick={(e) => { e.stopPropagation(); onDownload?.(); setShowMenu(false); }}
          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </button>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onRename?.(); setShowMenu(false); }}
        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Edit className="w-4 h-4" />
        <span>Rename</span>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete?.(); setShowMenu(false); }}
        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <Trash2 className="w-4 h-4" />
        <span>Delete</span>
      </button>
    </div>
  );

  return (
    <>
      {/* Preview Modal */}
      {showPreview && (
        <FilePreviewModal
          file={file}
          onClose={() => setShowPreview(false)}
          onDownload={() => { onDownload?.(); setShowPreview(false); }}
        />
      )}

      {viewMode === 'grid' ? (
        <div
          className={clsx(
            'group relative p-4 rounded-lg border-2 transition-all cursor-pointer',
            isSelected
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
          )}
          onClick={handleOpen}
          onContextMenu={handleContextMenu}
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <div className={clsx(
              'w-16 h-16 rounded-lg flex items-center justify-center',
              file.type === 'folder'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            )}>
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

          <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {file.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {showMenu && contextMenu}
        </div>
      ) : (
        <div
          className={clsx(
            'group flex items-center px-4 py-3 rounded-lg border transition-all cursor-pointer',
            isSelected
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
          )}
          onClick={handleOpen}
          onContextMenu={handleContextMenu}
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className={clsx(
              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
              file.type === 'folder'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            )}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {file.name}
            </p>
          </div>

          <div className="flex items-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
            <span className="w-20 text-right">
              {file.type === 'file' ? formatFileSize(file.size) : '--'}
            </span>
            <span className="w-24 text-right">{formatDate(file.updatedAt)}</span>
            <div className="flex items-center space-x-2">
              {file.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {showMenu && (
            <div
              ref={menuRef}
              className="absolute right-4 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
            >
              <button
                onClick={(e) => { e.stopPropagation(); onStar?.(); setShowMenu(false); }}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Star className="w-4 h-4" />
                <span>{file.isStarred ? 'Unstar' : 'Star'}</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onShare?.(); setShowMenu(false); }}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              {file.type === 'file' && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDownload?.(); setShowMenu(false); }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onRename?.(); setShowMenu(false); }}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Edit className="w-4 h-4" />
                <span>Rename</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete?.(); setShowMenu(false); }}
                className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};