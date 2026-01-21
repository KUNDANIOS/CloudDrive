'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useFileStore } from '@/lib/store/fileStore';

export const Breadcrumb: React.FC = () => {
  const { breadcrumbs } = useFileStore();

  const handleBreadcrumbClick = (index: number) => {
    // Navigate to folder - implementation in FileGrid/FileList
    console.log('Navigate to:', breadcrumbs[index]);
  };

  return (
    <nav className="flex items-center space-x-1 text-sm">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.id}>
          {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
          <button
            onClick={() => handleBreadcrumbClick(index)}
            className={`px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              index === breadcrumbs.length - 1
                ? 'text-gray-900 dark:text-white font-medium'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {crumb.name}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};