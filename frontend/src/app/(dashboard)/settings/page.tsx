'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { authApi } from '@/lib/api/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { 
  Shield, 
  Phone, 
  Mail, 
  User, 
  Lock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Phone verification state
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneOTP, setPhoneOTP] = useState('');
  const [phoneOTPSent, setPhoneOTPSent] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    if (user) {
      setTwoFactorEnabled(user.twoFactorEnabled || false);
    }
  }, [user]);

  // Reload user data
  const reloadUser = async () => {
    try {
      const updatedUser = await authApi.getCurrentUser();
      setUser(updatedUser);
    } catch (err) {
      console.error('Failed to reload user:', err);
    }
  };

  // Handle phone number submission
  const handleAddPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPhoneLoading(true);

    try {
      await authApi.addPhone(phoneNumber);
      setPhoneOTPSent(true);
      setSuccess('OTP sent to your phone! Please check your messages.');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setPhoneLoading(false);
    }
  };

  // Handle phone OTP verification
  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPhoneLoading(true);

    try {
      await authApi.verifyPhone(phoneNumber, phoneOTP);
      setSuccess('Phone number verified successfully!');
      setShowPhoneModal(false);
      setPhoneNumber('');
      setPhoneOTP('');
      setPhoneOTPSent(false);
      await reloadUser();
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setPhoneLoading(false);
    }
  };

  // Toggle 2FA
  const handleToggle2FA = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (twoFactorEnabled) {
        await authApi.disable2FA();
        setTwoFactorEnabled(false);
        setSuccess('Two-factor authentication disabled');
      } else {
        await authApi.enable2FA();
        setTwoFactorEnabled(true);
        setSuccess('Two-factor authentication enabled! You will receive a code via email on your next login.');
      }
      await reloadUser();
    } catch (err: any) {
      setError(err.message || 'Failed to update 2FA settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Account Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account security and preferences
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
        </div>
      )}

      {/* Profile Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <User className="w-5 h-5 mr-2" />
            Profile Information
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <div className="text-gray-900 dark:text-white">{user?.name}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-gray-900 dark:text-white">{user?.email}</span>
              {user?.emailVerified ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Phone Number */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Phone className="w-5 h-5 mr-2" />
            Phone Number
          </h2>
        </div>
        <div className="p-6">
          {user?.phoneVerified ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-900 dark:text-white">{user.phoneNumber}</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Your phone number is verified
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowPhoneModal(true);
                  setPhoneNumber('');
                  setPhoneOTP('');
                  setPhoneOTPSent(false);
                }}
              >
                Change Number
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Add a phone number for additional security and account recovery
              </p>
              <Button onClick={() => setShowPhoneModal(true)}>
                <Phone className="w-4 h-4 mr-2" />
                Add Phone Number
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Two-Factor Authentication (2FA)
          </h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Email-based 2FA
                </h3>
                {twoFactorEnabled ? (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium rounded">
                    Enabled
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs font-medium rounded">
                    Disabled
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {twoFactorEnabled
                  ? 'You will receive a verification code via email each time you log in'
                  : 'Add an extra layer of security to your account by requiring a verification code'}
              </p>
            </div>
            <Button
              onClick={handleToggle2FA}
              loading={loading}
              variant={twoFactorEnabled ? 'danger' : 'primary'}
            >
              {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </Button>
          </div>
        </div>
      </div>

      {/* Security Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center">
          <Lock className="w-5 h-5 mr-2" />
          Security Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Enable two-factor authentication for enhanced security</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Add a verified phone number for account recovery</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Use a strong, unique password that you don't use elsewhere</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Never share your verification codes with anyone</span>
          </li>
        </ul>
      </div>

      {/* Phone Verification Modal */}
      <Modal
        isOpen={showPhoneModal}
        onClose={() => {
          setShowPhoneModal(false);
          setPhoneNumber('');
          setPhoneOTP('');
          setPhoneOTPSent(false);
          setError('');
          setSuccess('');
        }}
        title={phoneOTPSent ? 'Verify Phone Number' : 'Add Phone Number'}
        size="sm"
      >
        {!phoneOTPSent ? (
          <form onSubmit={handleAddPhone} className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter your phone number in international format (e.g., +1234567890)
            </p>
            
            <Input
              type="tel"
              label="Phone Number"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              leftIcon={<Phone className="w-5 h-5" />}
              required
            />

            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowPhoneModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={phoneLoading}>
                Send OTP
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyPhone} className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We've sent a 6-digit code to {phoneNumber}
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Verification Code
              </label>
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={phoneOTP}
                onChange={(e) => setPhoneOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                autoFocus
                className="text-center text-2xl tracking-widest"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setPhoneOTPSent(false);
                  setPhoneOTP('');
                }}
              >
                Back
              </Button>
              <Button type="submit" loading={phoneLoading} disabled={phoneOTP.length !== 6}>
                Verify
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}