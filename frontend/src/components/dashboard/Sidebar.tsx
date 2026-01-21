'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  FolderOpen,
  Users,
  Clock,
  Star,
  Trash2,
  HardDrive,
  Plus,
} from 'lucide-react';
import clsx from 'clsx';
import { useUIStore } from '@/lib/store/uiStore';
import { useAuthStore } from '@/lib/store/authStore';
import { formatFileSize } from '@/lib/utils/formatters';

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'My Drive', href: '/my-drive', icon: FolderOpen },
  { name: 'Shared with me', href: '/shared', icon: Users },
  { name: 'Recent', href: '/recent', icon: Clock },
  { name: 'Starred', href: '/starred', icon: Star },
  { name: 'Trash', href: '/trash', icon: Trash2 },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { sidebarOpen } = useUIStore();
  const { user } = useAuthStore();
  const { openModal } = useUIStore();

  if (!sidebarOpen) return null;

  const storagePercent = user
    ? Math.round((user.storageUsed / user.storageLimit) * 100)
    : 0;

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-xl font-semibold text-gray-900 dark:text-white">
            CloudDrive
          </span>
        </Link>
      </div>

      {/* New Button */}
      <div className="p-4">
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
              className={clsx(
                'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Storage Indicator */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <HardDrive className="w-4 h-4" />
              <span>Storage</span>
            </div>
            <span className="text-gray-900 dark:text-white font-medium">
              {storagePercent}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={clsx(
                'h-2 rounded-full transition-all',
                storagePercent > 90
                  ? 'bg-red-500'
                  : storagePercent > 75
                  ? 'bg-yellow-500'
                  : 'bg-blue-500'
              )}
              style={{ width: `${Math.min(storagePercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatFileSize(user?.storageUsed)} of{' '}
            {formatFileSize(user?.storageLimit)} used
          </p>
        </div>
      </div>
    </aside>
  );
};