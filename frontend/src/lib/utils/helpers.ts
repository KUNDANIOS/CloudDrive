// Generate random ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Check if file is image
export const isImage = (mimeType?: string): boolean => {
  return mimeType?.startsWith('image/') || false;
};

// Check if file is video
export const isVideo = (mimeType?: string): boolean => {
  return mimeType?.startsWith('video/') || false;
};

// Check if file is audio
export const isAudio = (mimeType?: string): boolean => {
  return mimeType?.startsWith('audio/') || false;
};

// Check if file is document
export const isDocument = (mimeType?: string): boolean => {
  if (!mimeType) return false;
  return (
    mimeType.includes('pdf') ||
    mimeType.includes('word') ||
    mimeType.includes('document') ||
    mimeType.includes('text')
  );
};

// Get file category
export const getFileCategory = (mimeType?: string): string => {
  if (isImage(mimeType)) return 'image';
  if (isVideo(mimeType)) return 'video';
  if (isAudio(mimeType)) return 'audio';
  if (isDocument(mimeType)) return 'document';
  return 'other';
};

// Format bytes to human readable
export const bytesToSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
};

// Copy to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

// Download file
export const downloadFile = (url: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Get file extension from filename
export const getExtension = (filename: string): string => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
};

// Check if dark mode is enabled
export const isDarkMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    localStorage.getItem('darkMode') === 'true' ||
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
};

// Format number with commas
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Sleep/delay function
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};