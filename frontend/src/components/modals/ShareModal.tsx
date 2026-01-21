'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/lib/store/uiStore';
import { sharesApi } from '@/lib/api/shares';
import { Link2, Mail, Copy, Check, X } from 'lucide-react';

export const ShareModal: React.FC = () => {
  const { activeModal, modalData, closeModal } = useUIStore();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shares, setShares] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isOpen = activeModal === 'share';
  const file = modalData;

  const shareLink = file ? `${window.location.origin}/shared/${file.id}` : '';

  useEffect(() => {
    if (isOpen && file) {
      loadShares();
    }
  }, [isOpen, file]);

  const loadShares = async () => {
    if (!file) return;
    try {
      const data = await sharesApi.getFileShares(file.id);
      setShares(data);
    } catch (err) {
      console.error('Failed to load shares:', err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShareEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !email) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await sharesApi.shareViaEmail(file.id, email, message);
      setSuccess(`File shared with ${email}`);
      setEmail('');
      setMessage('');
      await loadShares(); // Refresh shares list
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to share file');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    try {
      await sharesApi.removeShare(shareId);
      await loadShares();
    } catch (err) {
      console.error('Failed to remove share:', err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title={`Share "${file?.name}"`} size="md">
      <div className="space-y-6">
        {/* Success message */}
        {success && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-600 dark:text-green-400">
            {success}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Share with people */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Share with people
          </h3>
          <form onSubmit={handleShareEmail} className="space-y-3">
            <Input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-5 h-5" />}
              required
            />
            <Input
              type="text"
              placeholder="Add a message (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button type="submit" loading={loading} className="w-full">
              Send Invitation
            </Button>
          </form>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Or share with link
          </h3>
          <div className="flex items-center space-x-2">
            <div className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {shareLink}
                </p>
              </div>
            </div>
            <Button variant="secondary" onClick={handleCopyLink}>
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Shared with */}
        {shares.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Shared with
            </h3>
            <div className="space-y-2">
              {shares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {share.shared_with_email}
                  </span>
                  <button
                    onClick={() => handleRemoveShare(share.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};