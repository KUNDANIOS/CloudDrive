import { format, formatDistanceToNow } from 'date-fns';

// Format file size
export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

// Format date
export const formatDate = (date: string | Date): string => {
  try {
    return format(new Date(date), 'MMM d, yyyy');
  } catch {
    return 'Invalid date';
  }
};

// Format date with time
export const formatDateTime = (date: string | Date): string => {
  try {
    return format(new Date(date), 'MMM d, yyyy h:mm a');
  } catch {
    return 'Invalid date';
  }
};

// Format relative time
export const formatRelativeTime = (date: string | Date): string => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return 'Invalid date';
  }
};

// Get file icon based on mime type
export const getFileIcon = (mimeType?: string, type?: string): string => {
  if (type === 'folder') return '📁';
  
  if (!mimeType) return '📄';

  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎥';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType.includes('pdf')) return '📕';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📘';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📗';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📙';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return '🗜️';
  if (mimeType.includes('text')) return '📝';

  return '📄';
};

// Get file color based on type
export const getFileColor = (mimeType?: string, type?: string): string => {
  if (type === 'folder') return 'text-blue-500';
  
  if (!mimeType) return 'text-gray-500';

  if (mimeType.startsWith('image/')) return 'text-purple-500';
  if (mimeType.startsWith('video/')) return 'text-red-500';
  if (mimeType.startsWith('audio/')) return 'text-pink-500';
  if (mimeType.includes('pdf')) return 'text-red-600';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'text-blue-600';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'text-green-600';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'text-orange-600';

  return 'text-gray-500';
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Get file extension
export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';
};