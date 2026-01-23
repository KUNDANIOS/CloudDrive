'use client';

import React, { useState } from 'react';
import { Image, Mail, Calendar, FileText, Folder, CheckSquare, Users, MapPin, X } from 'lucide-react';
import { QuickAccessApps } from './QuickAccessApps';

interface AppIconProps {
  icon: React.ElementType;
  label: string;
  gradient: string;
  onClick: () => void;
}

const AppIcon: React.FC<AppIconProps> = ({ icon: Icon, label, gradient, onClick }) => {
  return (
    <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={onClick}>
      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${gradient} flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2} />
      </div>
      <span className="text-[10px] sm:text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{label}</span>
    </div>
  );
};

export const Footer: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState('');

  const handleAppClick = (appName: string) => {
    setSelectedApp(appName);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setSelectedApp(''), 300);
  };

  const apps = [
    {
      icon: Image,
      label: "Photos",
      gradient: "bg-gradient-to-br from-orange-400 via-pink-400 to-pink-500"
    },
    {
      icon: Mail,
      label: "Mail",
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      icon: Calendar,
      label: "Calendar",
      gradient: "bg-gradient-to-br from-red-500 to-red-600"
    },
    {
      icon: FileText,
      label: "Notes",
      gradient: "bg-gradient-to-br from-yellow-400 to-yellow-500"
    },
    {
      icon: Folder,
      label: "Files",
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      icon: CheckSquare,
      label: "Reminders",
      gradient: "bg-gradient-to-br from-orange-500 to-red-500"
    },
    {
      icon: Users,
      label: "Contacts",
      gradient: "bg-gray-700"
    },
    {
      icon: MapPin,
      label: "Find My",
      gradient: "bg-gradient-to-br from-green-500 to-green-600"
    }
  ];

  return (
    <>
      <footer className="w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 sm:py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-4 sm:gap-6 justify-items-center">
            {apps.map((app, index) => (
              <AppIcon
                key={index}
                icon={app.icon}
                label={app.label}
                gradient={app.gradient}
                onClick={() => handleAppClick(app.label)}
              />
            ))}
          </div>
        </div>
      </footer>

      {/* Full Screen App Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {selectedApp}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-4 sm:p-6">
              <QuickAccessApps appName={selectedApp} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};