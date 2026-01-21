'use client';

import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { filesApi } from '@/lib/api/files';
import { useFileStore } from '@/lib/store/fileStore';

interface UploadButtonProps {
  folderId?: string | null;
  onUploadComplete?: () => void;
}

export const UploadButton: React.FC<UploadButtonProps> = ({
  folderId,
  onUploadComplete,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addUpload, updateUpload, removeUpload } = useFileStore();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      uploadFile(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (file: File) => {
    const uploadId = `upload-${Date.now()}-${Math.random()}`;

    // Add to upload queue
    addUpload({
      fileId: uploadId,
      fileName: file.name,
      progress: 0,
      status: 'uploading',
    });

    try {
      console.log('Uploading file to folder:', folderId); // Debug log
      
      await filesApi.uploadFile(file, folderId, (progress) => {
        updateUpload(uploadId, { progress });
      });

      // Mark as completed
      updateUpload(uploadId, { status: 'completed', progress: 100 });

      // Remove from queue after 2 seconds
      setTimeout(() => {
        removeUpload(uploadId);
      }, 2000);

      // Call success callback to refresh the list
      onUploadComplete?.();
    } catch (error: any) {
      console.error('Upload error:', error);
      updateUpload(uploadId, {
        status: 'error',
        error: error.message || 'Upload failed',
      });

      // Remove from queue after 5 seconds
      setTimeout(() => {
        removeUpload(uploadId);
      }, 5000);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="*/*"
      />
      <Button variant="secondary" onClick={handleButtonClick}>
        <Upload className="w-4 h-4 mr-2" />
        Upload
      </Button>
    </>
  );
};