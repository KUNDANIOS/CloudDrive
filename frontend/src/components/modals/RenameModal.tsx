'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/lib/store/uiStore';
import { filesApi } from '@/lib/api/files';
import { foldersApi } from '@/lib/api/folders';
import { Edit } from 'lucide-react';

export const RenameModal: React.FC = () => {
  const { activeModal, modalData, closeModal } = useUIStore();
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isOpen = activeModal === 'rename';
  const file = modalData;

  useEffect(() => {
    if (isOpen && file) {
      setNewName(file.name);
      setError('');
    }
  }, [isOpen, file]);

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !newName.trim()) return;

    setLoading(true);
    setError('');

    try {
      if (file.type === 'folder') {
        await foldersApi.renameFolder(file.id, newName.trim());
      } else {
        await filesApi.renameFile(file.id, newName.trim());
      }

      // Call success callback
      const callback = (window as any).__operationSuccessCallback;
      if (callback) {
        callback();
      }

      closeModal();
    } catch (err: any) {
      setError(err.message || 'Failed to rename');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    closeModal();
    setNewName('');
    setError('');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Rename" size="sm">
      <form onSubmit={handleRename} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <Input
          label="New name"
          placeholder="Enter new name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          leftIcon={<Edit className="w-5 h-5" />}
          autoFocus
        />

        <div className="flex items-center justify-end space-x-3 pt-4">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Rename
          </Button>
        </div>
      </form>
    </Modal>
  );
};