import { useState } from 'react';
import { filesApi } from '../api/files';
import { useFileStore } from '../store/fileStore';

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { addUpload, updateUpload, removeUpload } = useFileStore();

  const uploadFiles = async (files: File[], folderId?: string | null) => {
    setIsUploading(true);

    const uploadPromises = Array.from(files).map(async (file) => {
      const uploadId = `upload-${Date.now()}-${Math.random()}`;

      addUpload({
        fileId: uploadId,
        fileName: file.name,
        progress: 0,
        status: 'uploading',
      });

      try {
        await filesApi.uploadFile(file, folderId, (progress) => {
          updateUpload(uploadId, { progress });
        });

        updateUpload(uploadId, { status: 'completed', progress: 100 });

        setTimeout(() => {
          removeUpload(uploadId);
        }, 2000);

        return { success: true, file };
      } catch (error: any) {
        updateUpload(uploadId, {
          status: 'error',
          error: error.message || 'Upload failed',
        });

        setTimeout(() => {
          removeUpload(uploadId);
        }, 5000);

        return { success: false, file, error };
      }
    });

    const results = await Promise.all(uploadPromises);
    setIsUploading(false);

    return results;
  };

  return {
    uploadFiles,
    isUploading,
  };
};