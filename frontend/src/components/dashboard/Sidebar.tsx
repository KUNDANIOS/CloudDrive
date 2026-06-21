'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, FolderOpen, Users, Clock, Star, Trash2, HardDrive, Plus, X,
} from 'lucide-react';
import clsx from 'clsx';
import { useUIStore } from '@/lib/store/uiStore';
import { useFileStore } from '@/lib/store/fileStore';
import { filesApi } from '@/lib/api/files';

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'My Drive', href: '/my-drive', icon: FolderOpen },
  { name: 'Shared with me', href: '/shared', icon: Users },
  { name: 'Recent', href: '/recent', icon: Clock },
  { name: 'Starred', href: '/starred', icon: Star },
  { name: 'Trash', href: '/trash', icon: Trash2 },
];

const formatFileSize = (bytes: number | undefined): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { sidebarOpen, openModal, toggleSidebar } = useUIStore();
  const { refreshTrigger } = useFileStore();
  const [storage, setStorage] = useState<{ used: number; limit: number } | null>(null);
  const [isLoadingStorage, setIsLoadingStorage] = useState(true);

  const loadStorage = async () => {
    try {
      const data = await filesApi.getStorageUsage();
      setStorage(data);
    } catch (error) {
      console.error('Failed to load storage:', error);
    } finally {
      setIsLoadingStorage(false);
    }
  };

  useEffect(() => {
    loadStorage();
    const interval = setInterval(loadStorage, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refresh storage when files change
  useEffect(() => {
    if (refreshTrigger > 0) loadStorage();
  }, [refreshTrigger]);

  const storagePercent = storage
    ? Math.min(Math.round((storage.used / storage.limit) * 100), 100)
    : 0;

  const getStorageColor = () => {
    if (storagePercent >= 90) return 'bg-red-500';
    if (storagePercent >= 75) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar — always visible on lg+, slide in/out on mobile */}
      <aside
        className={clsx(
          'w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen fixed left-0 top-0 z-50 transition-transform duration-300',
          // On mobile: slide in/out. On desktop: always visible
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              CloudDrive
            </span>
          </Link>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Button */}
        <div className="p-4 flex-shrink-0">
          <button
            onClick={() => openModal('createFolder')}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>New</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  // Close sidebar on mobile after navigation
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className={clsx(
                  'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Storage Indicator */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <HardDrive className="w-4 h-4" />
                <span>Storage</span>
              </div>
              <span className="text-gray-900 dark:text-white font-medium">
                {isLoadingStorage ? '...' : `${storagePercent}%`}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className={clsx('h-2 rounded-full transition-all duration-300', getStorageColor())}
                style={{ width: `${storagePercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {storage
                ? `${formatFileSize(storage.used)} of ${formatFileSize(storage.limit)} used`
                : '0 B of 5 GB used'}
            </p>
            {storagePercent >= 90 && (
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                Storage almost full!
              </p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};