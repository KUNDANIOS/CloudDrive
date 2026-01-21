'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/lib/store/uiStore';
import { filesApi } from '@/lib/api/files';
import { foldersApi } from '@/lib/api/folders';
import { AlertTriangle } from 'lucide-react';

export const DeleteModal: React.FC = () => {
  const { activeModal, modalData, closeModal } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isOpen = activeModal === 'delete';
  const file = modalData;

  const handleDelete = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      if (file.type === 'folder') {
        await foldersApi.deleteFolder(file.id);
      } else {
        await filesApi.deleteFile(file.id);
      }

      // Call success callback
      const callback = (window as any).__operationSuccessCallback;
      if (callback) {
        callback();
      }

      closeModal();
    } catch (err: any) {
      setError(err.message || 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Delete item" size="sm">
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{file?.name}</strong>? This item will be moved to trash.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 pt-4">
          <Button type="button" variant="ghost" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={loading}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};