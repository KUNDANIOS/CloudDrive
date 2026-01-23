'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { sharesApi } from '@/lib/api/shares';
import { filesApi } from '@/lib/api/files';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { 
  FileText, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  ArrowRight,
  Users 
} from 'lucide-react';

export default function SharedFilePage() {
  const params = useParams();
  const router = useRouter();
  const shareId = params.shareId as string;

  const [share, setShare] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    loadShare();
  }, [shareId]);

  const loadShare = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await sharesApi.getShareById(shareId);
      setShare(data.share);
      
      // Auto-accept if user is logged in
      const token = localStorage.getItem('token');
      if (token && data.share.status === 'pending') {
        await handleAcceptShare();
      }
    } catch (err: any) {
      console.error('Failed to load share:', err);
      setError(err.message || 'Failed to load shared file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptShare = async () => {
    setAccepting(true);
    try {
      await sharesApi.acceptShare(shareId);
      setAccepted(true);
    } catch (err: any) {
      console.error('Failed to accept share:', err);
      // Don't set error if user just needs to log in
      if (!err.message.includes('401')) {
        setError(err.message || 'Failed to accept share');
      }
    } finally {
      setAccepting(false);
    }
  };

  const handleDownload = async () => {
    if (!share?.file?.id) return;
    try {
      await filesApi.downloadFile(share.file.id);
    } catch (err) {
      console.error('Failed to download:', err);
    }
  };

  const handleGoToShared = () => {
    router.push('/shared');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading shared file...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
            Unable to access file
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            {error}
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/login')} 
              className="w-full"
            >
              Sign in to access
            </Button>
            <Button 
              onClick={() => router.push('/')} 
              variant="secondary"
              className="w-full"
            >
              Go to home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!share) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">Share not found</p>
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">File Shared With You</h1>
              <p className="text-blue-100 text-sm">
                {share.owner.name || share.owner.email} shared a file
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Success message */}
          {accepted && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                  Share accepted!
                </h3>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  This file is now available in your "Shared with me" section
                </p>
              </div>
            </div>
          )}

          {/* File info */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                    {share.file.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formatFileSize(share.file.size_bytes)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Shared on {new Date(share.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Shared by */}
          <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Shared by</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {share.owner.name || share.owner.email}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {!accepted && (
              <Button
                onClick={handleAcceptShare}
                loading={accepting}
                className="w-full"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Accept & Add to My Drive
              </Button>
            )}
            
            {accepted && (
              <Button
                onClick={handleGoToShared}
                className="w-full"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Go to Shared with me
              </Button>
            )}

            <Button
              onClick={handleDownload}
              variant="secondary"
              className="w-full"
            >
              <Download className="w-5 h-5 mr-2" />
              Download File
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}