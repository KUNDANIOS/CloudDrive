'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { authApi } from '@/lib/api/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Shield, Phone, User, Lock, CheckCircle, XCircle,
  AlertCircle, Camera, Eye, EyeOff, Key, Calendar,
  HardDrive, Trash2, Edit2, Save, X,
} from 'lucide-react';
import { filesApi } from '@/lib/api/files';
import { formatFileSize } from '@/lib/utils/formatters';

export default function SettingsPage() {
  const { user, setUser, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile edit state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Phone verification state
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneOTP, setPhoneOTP] = useState('');
  const [phoneOTPSent, setPhoneOTPSent] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Storage
  const [storage, setStorage] = useState<{ used: number; limit: number } | null>(null);

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    if (user) {
      setTwoFactorEnabled(user.twoFactorEnabled || false);
      setEditName(user.name || '');
    }
    loadStorage();
  }, [user]);

  const loadStorage = async () => {
    try {
      const data = await filesApi.getStorageUsage();
      setStorage(data);
    } catch {}
  };

  const showMessage = (type: 'success' | 'error', msg: string) => {
    if (type === 'success') { setSuccess(msg); setError(''); }
    else { setError(msg); setSuccess(''); }
    setTimeout(() => { setSuccess(''); setError(''); }, 4000);
  };

  const reloadUser = async () => {
    try {
      const updatedUser = await authApi.getCurrentUser();
      setUser(updatedUser);
    } catch {}
  };

  // Avatar upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showMessage('error', 'Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
    // TODO: upload to backend when API is ready
    showMessage('success', 'Profile picture updated!');
  };

  // Save name
  const handleSaveName = async () => {
    if (!editName.trim()) return;
    setLoading(true);
    try {
      // TODO: call authApi.updateProfile({ name: editName }) when ready
      setUser({ ...user!, name: editName });
      localStorage.setItem('user', JSON.stringify({ ...user!, name: editName }));
      setIsEditingName(false);
      showMessage('success', 'Name updated successfully!');
    } catch (err: any) {
      showMessage('error', err.message || 'Failed to update name');
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      showMessage('error', 'Password must be at least 8 characters');
      return;
    }
    setPasswordLoading(true);
    try {
      await authApi.resetPassword(currentPassword, newPassword);
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showMessage('success', 'Password changed successfully!');
    } catch (err: any) {
      showMessage('error', err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Phone
  const handleAddPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneLoading(true);
    try {
      await authApi.addPhone(phoneNumber);
      setPhoneOTPSent(true);
      showMessage('success', 'OTP sent to your phone!');
    } catch (err: any) {
      showMessage('error', err.message || 'Failed to send OTP');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneLoading(true);
    try {
      await authApi.verifyPhone(phoneNumber, phoneOTP);
      setShowPhoneModal(false);
      setPhoneNumber('');
      setPhoneOTP('');
      setPhoneOTPSent(false);
      showMessage('success', 'Phone number verified!');
      await reloadUser();
    } catch (err: any) {
      showMessage('error', err.message || 'Invalid OTP');
    } finally {
      setPhoneLoading(false);
    }
  };

  // 2FA
  const handleToggle2FA = async () => {
    setLoading(true);
    try {
      if (twoFactorEnabled) {
        await authApi.disable2FA();
        setTwoFactorEnabled(false);
        showMessage('success', 'Two-factor authentication disabled');
      } else {
        await authApi.enable2FA();
        setTwoFactorEnabled(true);
        showMessage('success', 'Two-factor authentication enabled!');
      }
      await reloadUser();
    } catch (err: any) {
      showMessage('error', err.message || 'Failed to update 2FA');
    } finally {
      setLoading(false);
    }
  };

  const storagePercent = storage
    ? Math.min(Math.round((storage.used / storage.limit) * 100), 100)
    : 0;

  const getInitials = (name: string) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile & Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your account, security, and preferences
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
        </div>
      )}

      {/* ── Profile Card ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5" /> Profile
          </h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  getInitials(user?.name || '')
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                title="Change photo"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Name & Email */}
            <div className="flex-1 space-y-4 w-full">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Display Name
                </label>
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      autoFocus
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setIsEditingName(false); }}
                    />
                    <button onClick={handleSaveName} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <Save className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setIsEditingName(false); setEditName(user?.name || ''); }} className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 dark:text-white font-medium">{user?.name}</span>
                    <button onClick={() => setIsEditingName(true)} className="p-1 text-gray-400 hover:text-blue-600 rounded">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 dark:text-white">{user?.email}</span>
                  {user?.emailVerified ? (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                      <XCircle className="w-3 h-3" /> Unverified
                    </span>
                  )}
                </div>
              </div>

              {/* Joined date */}
              {user?.createdAt && (
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Storage Card ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5" /> Storage
          </h2>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {storage ? formatFileSize(storage.used) : '0 B'} used
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {storage ? formatFileSize(storage.limit) : '5 GB'} total
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${storagePercent >= 90 ? 'bg-red-500' : storagePercent >= 75 ? 'bg-yellow-500' : 'bg-blue-500'}`}
              style={{ width: `${storagePercent}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{storagePercent}% of storage used</p>
          {storagePercent >= 90 && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                ⚠️ Storage almost full. Delete files to free up space.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Security Card ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5" /> Security
          </h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {/* Change Password */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <Key className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Password</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Change your account password</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setShowPasswordModal(true)}>
              Change
            </Button>
          </div>

          {/* Phone Number */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Phone Number</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.phoneVerified
                    ? <span className="flex items-center gap-1">{user.phoneNumber} <CheckCircle className="w-3 h-3 text-green-500 inline" /></span>
                    : 'Add for account recovery'}
                </p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setShowPhoneModal(true)}>
              {user?.phoneVerified ? 'Change' : 'Add'}
            </Button>
          </div>

          {/* 2FA */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                  {twoFactorEnabled ? (
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">On</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full">Off</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {twoFactorEnabled ? 'Email code required on login' : 'Add extra login security'}
                </p>
              </div>
            </div>
            <Button
              variant={twoFactorEnabled ? 'danger' : 'primary'}
              size="sm"
              onClick={handleToggle2FA}
              loading={loading}
            >
              {twoFactorEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Security Tips ── */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
          <Lock className="w-5 h-5" /> Security Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
          {[
            'Enable two-factor authentication for enhanced security',
            'Add a verified phone number for account recovery',
            'Use a strong, unique password with letters, numbers, and symbols',
            'Never share your verification codes with anyone',
            'Sign out from shared or public devices after use',
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-blue-500 font-bold mt-0.5">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Danger Zone ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-red-100 dark:border-red-800">
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
            <Trash2 className="w-5 h-5" /> Danger Zone
          </h2>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Delete Account</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Permanently delete your account and all files. This cannot be undone.
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
            Delete Account
          </Button>
        </div>
      </div>

      {/* ── Change Password Modal ── */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => { setShowPasswordModal(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}
        title="Change Password"
        size="sm"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="relative">
            <Input
              type={showCurrentPwd ? 'text' : 'password'}
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
              {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <Input
              type={showNewPwd ? 'text' : 'password'}
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button type="button" onClick={() => setShowNewPwd(!showNewPwd)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
              {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <Input
              type={showConfirmPwd ? 'text' : 'password'}
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
              {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {newPassword && newPassword.length < 8 && (
            <p className="text-xs text-red-500">Password must be at least 8 characters</p>
          )}
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-red-500">Passwords do not match</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
            <Button type="submit" loading={passwordLoading} disabled={!currentPassword || newPassword.length < 8 || newPassword !== confirmPassword}>
              Change Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Phone Modal ── */}
      <Modal
        isOpen={showPhoneModal}
        onClose={() => { setShowPhoneModal(false); setPhoneNumber(''); setPhoneOTP(''); setPhoneOTPSent(false); }}
        title={phoneOTPSent ? 'Verify Phone' : 'Add Phone Number'}
        size="sm"
      >
        {!phoneOTPSent ? (
          <form onSubmit={handleAddPhone} className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter your number in international format (e.g., +1234567890)
            </p>
            <Input type="tel" label="Phone Number" placeholder="+1234567890"
              value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowPhoneModal(false)}>Cancel</Button>
              <Button type="submit" loading={phoneLoading}>Send OTP</Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyPhone} className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We sent a 6-digit code to <strong>{phoneNumber}</strong>
            </p>
            <Input type="text" label="Verification Code" placeholder="000000"
              value={phoneOTP} onChange={(e) => setPhoneOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6} autoFocus className="text-center text-2xl tracking-widest" />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => { setPhoneOTPSent(false); setPhoneOTP(''); }}>Back</Button>
              <Button type="submit" loading={phoneLoading} disabled={phoneOTP.length !== 6}>Verify</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── Delete Account Modal ── */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
        title="Delete Account"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-400 font-medium">
              ⚠️ This will permanently delete your account and ALL your files. This action cannot be undone.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type <strong>DELETE</strong> to confirm
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="DELETE"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button
              variant="danger"
              disabled={deleteConfirmText !== 'DELETE'}
              onClick={() => {
                // TODO: call delete account API when ready
                logout();
              }}
            >
              Delete My Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}