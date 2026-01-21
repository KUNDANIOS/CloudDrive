// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

// Strong password validation
export const isStrongPassword = (password: string): boolean => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLongEnough = password.length >= 8;

  return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLongEnough;
};

// Get password strength
export const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (password.length < 6) return 'weak';
  if (isStrongPassword(password)) return 'strong';
  return 'medium';
};

// Filename validation
export const isValidFilename = (filename: string): boolean => {
  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*\x00-\x1f]/g;
  return !invalidChars.test(filename) && filename.length > 0 && filename.length <= 255;
};

// File size validation (in bytes)
export const isValidFileSize = (size: number, maxSize: number = 100 * 1024 * 1024): boolean => {
  return size > 0 && size <= maxSize; // Default max: 100MB
};

// File type validation
export const isAllowedFileType = (mimeType: string, allowedTypes: string[]): boolean => {
  return allowedTypes.some((type) => {
    if (type.endsWith('/*')) {
      return mimeType.startsWith(type.replace('/*', ''));
    }
    return mimeType === type;
  });
};

// Folder name validation
export const isValidFolderName = (name: string): boolean => {
  const invalidChars = /[<>:"/\\|?*\x00-\x1f]/g;
  const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'LPT1'];
  
  return (
    !invalidChars.test(name) &&
    name.length > 0 &&
    name.length <= 255 &&
    !reservedNames.includes(name.toUpperCase()) &&
    name !== '.' &&
    name !== '..'
  );
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Phone number validation (basic)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

// Check if string is empty or whitespace
export const isEmpty = (str: string): boolean => {
  return !str || str.trim().length === 0;
};

// Validate form data
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateLoginForm = (email: string, password: string): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!isValidEmail(email)) {
    errors.email = 'Invalid email address';
  }

  if (isEmpty(password)) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateRegisterForm = (
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): ValidationResult => {
  const errors: Record<string, string> = {};

  if (isEmpty(name)) {
    errors.name = 'Name is required';
  }

  if (!isValidEmail(email)) {
    errors.email = 'Invalid email address';
  }

  if (!isValidPassword(password)) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};