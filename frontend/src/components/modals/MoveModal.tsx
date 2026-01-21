'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/lib/store/uiStore';
import { filesApi } from '@/lib/api/files';
import { foldersApi } from '@/lib/api/folders';
import { Folder, ChevronRight } from 'lucide-react';
import { FileItem } from '@/lib/types';

interface MoveModalProps {
  onSuccess?: () => void;
}

export const MoveModal: React.FC<MoveModalProps> = ({ onSuccess }) => {
  const { activeModal, modalData, closeModal } = useUIStore();
  const [folders, setFolders] = useState<FileItem[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isOpen = activeModal === 'move';
  const file = modalData;

  useEffect(() => {
    if (isOpen) {
      loadFolders();
    }
  }, [isOpen]);

  const loadFolders = async () => {
    try {
      const data = await foldersApi.getFolderContents();
      setFolders(data.filter((item) => item.type === 'folder'));
    } catch (err) {
      console.error('Failed to load folders:', err);
    }
  };

  const handleMove = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      if (file.type === 'folder') {
        await foldersApi.moveFolder(file.id, selectedFolder);
      } else {
        await filesApi.moveFile(file.id, selectedFolder);
      }

      onSuccess?.();
      closeModal();
    } catch (err: any) {
      setError(err.message || 'Failed to move');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Move to" size="md">
      <div className="space-y-4">
        <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
          {/* Root folder option */}
          <button
            onClick={() => setSelectedFolder(null)}
            className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
              selectedFolder === null ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
          >
            <Folder className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium">My Drive (Root)</span>
          </button>

          {/* Folder list */}
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                selectedFolder === folder.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
              disabled={folder.id === file?.id}
            >
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <Folder className="w-5 h-5 text-blue-600" />
              <span className="text-sm">{folder.name}</span>
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 pt-4">
          <Button type="button" variant="ghost" onClick={closeModal}>
            Cancel
          </Button>
          <Button onClick={handleMove} loading={loading}>
            Move here
          </Button>
        </div>
      </div>
    </Modal>
  );
};