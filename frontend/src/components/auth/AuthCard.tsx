'use client';

import React from 'react';
import { Cloud } from 'lucide-react';
import Link from 'next/link';

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center">
            <Cloud className="w-16 h-16 text-blue-600 mb-4" />
            <h1 className="text-4xl font-bold text-gray-900">CloudDrive</h1>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-soft p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
            {subtitle && (
              <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};