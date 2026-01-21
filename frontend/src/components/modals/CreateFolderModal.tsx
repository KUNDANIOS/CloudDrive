'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/lib/store/uiStore';
import { foldersApi } from '@/lib/api/folders';
import { Folder } from 'lucide-react';

export const CreateFolderModal: React.FC = () => {
  const { activeModal, closeModal } = useUIStore();
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isOpen = activeModal === 'createFolder';

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFolderName('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!folderName.trim()) {
      setError('Folder name is required');
      return;
    }

    setLoading(true);
    try {
      await foldersApi.createFolder(folderName.trim());
      
      // Call success callback if available
      const callback = (window as any).__operationSuccessCallback;
      if (callback) {
        callback();
      }
      
      closeModal();
      setFolderName('');
    } catch (err: any) {
      setError(err.message || 'Failed to create folder');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    closeModal();
    setFolderName('');
    setError('');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Folder" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <Input
          label="Folder Name"
          placeholder="Enter folder name"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          leftIcon={<Folder className="w-5 h-5" />}
          autoFocus
        />

        <div className="flex items-center justify-end space-x-3 pt-4">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create Folder
          </Button>
        </div>
      </form>
    </Modal>
  );
};