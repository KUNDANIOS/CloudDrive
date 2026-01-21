'use client';

import React from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';
import { useUIStore } from '@/lib/store/uiStore';
import { CreateFolderModal } from '@/components/modals/CreateFolderModal';
import { RenameModal } from '@/components/modals/RenameModal';
import { DeleteModal } from '@/components/modals/DeleteModal';
import { ShareModal } from '@/components/modals/ShareModal';
import { UploadProgress } from '@/components/dashboard/UploadProgress';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Topbar />
      <div className="flex pt-16">
        <Sidebar />
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
          }`}
        >
          <div className="p-6">{children}</div>
        </main>
      </div>

      {/* Global Modals */}
      <CreateFolderModal />
      <RenameModal />
      <DeleteModal />
      <ShareModal />
      <UploadProgress />
    </div>
  );
}