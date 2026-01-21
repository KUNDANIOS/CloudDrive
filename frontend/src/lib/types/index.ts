// User type with all auth fields
export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  twoFactorEnabled?: boolean;
  storageUsed?: number;
  storageLimit?: number;
  createdAt: string;
  updatedAt?: string;
}

// Auth response
export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
  requires2FA?: boolean;
  requiresVerification?: boolean;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Register credentials
export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

// Auth state
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialize: () => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

// OTP Verification
export interface OTPVerification {
  id: string;
  userId: string;
  email?: string;
  phoneNumber?: string;
  otpCode: string;
  otpType: 'email_verification' | 'phone_verification' | 'two_factor' | 'reset';
  attempts: number;
  verified: boolean;
  expiresAt: string;
  createdAt: string;
}

// Password Reset Token
export interface PasswordResetToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

// File types (existing - keep these)
export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  mimeType?: string;
  parentId?: string | null;
  path: string;
  isStarred: boolean;
  isTrashed: boolean;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  sharedWith?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  type: 'folder';
  parentId?: string | null;
  path: string;
  isStarred: boolean;
  isTrashed: boolean;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Upload state
export interface Upload {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

// File state
export interface FileState {
  files: FileItem[];
  currentFolder: Folder | null;
  selectedFiles: string[];
  viewMode: 'grid' | 'list';
  isLoading: boolean;
  breadcrumbs: Array<{ id: string; name: string; path: string }>;
  searchQuery: string;
  uploads: Upload[];
  setFiles: (files: FileItem[]) => void;
  setCurrentFolder: (folder: Folder | null) => void;
  setSelectedFiles: (ids: string[]) => void;
  toggleFileSelection: (id: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setBreadcrumbs: (breadcrumbs: Array<{ id: string; name: string; path: string }>) => void;
  setSearchQuery: (query: string) => void;
  addUpload: (upload: Upload) => void;
  updateUpload: (fileId: string, update: Partial<Upload>) => void;
  removeUpload: (fileId: string) => void;
}

// Modal types
export type ModalType = 'createFolder' | 'rename' | 'delete' | 'share' | 'move' | null;

// UI state
export interface UIState {
  isDarkMode: boolean;
  sidebarOpen: boolean;
  activeModal: ModalType;
  modalData: any;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  openModal: (modal: ModalType, data?: any) => void;
  closeModal: () => void;
}