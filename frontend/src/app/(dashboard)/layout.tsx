'use client';

import React, { useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';
import { Footer } from '@/components/dashboard/Footer';
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
  const { sidebarOpen, toggleSidebar } = useUIStore();

  // Auto-close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && sidebarOpen) {
        toggleSidebar();
      }
    };

    // Set initial state based on screen size
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      if (sidebarOpen) toggleSidebar();
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Topbar - Fixed at top */}
      <Topbar />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Container */}
      <div className="flex pt-16 min-h-[calc(100vh-4rem)]">
        {/* Sidebar - Responsive */}
        <Sidebar />

        {/* Main Content */}
        <main
          className={`
            flex-1 flex flex-col transition-all duration-300 w-full
            ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}
          `}
        >
          {/* Content Area with responsive padding */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-4">
            {children}
          </div>
          
          {/* Footer */}
          <Footer />
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