import apiClient, { handleApiError } from './client';
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types';

export const authApi = {
  // Register user
  register: async (credentials: RegisterCredentials): Promise<{ message: string; userId: string; email: string; requiresVerification: boolean }> => {
    try {
      console.log('📝 Calling register API');
      const response = await apiClient.post('/auth/register', credentials);
      console.log('✅ Register response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Register error:', error);
      throw new Error(handleApiError(error));
    }
  },

  // Verify email OTP
  verifyEmail: async (email: string, otp: string): Promise<AuthResponse> => {
    try {
      console.log('✉️ Calling verify email API');
      const response = await apiClient.post<AuthResponse>('/auth/verify-email', { email, otp });
      console.log('✅ Verify email response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Verify email error:', error);
      throw new Error(handleApiError(error));
    }
  },

  // Resend email OTP
  resendEmailOTP: async (email: string): Promise<void> => {
    try {
      console.log('🔄 Calling resend OTP API');
      await apiClient.post('/auth/resend-email-otp', { email });
      console.log('✅ Resend OTP successful');
    } catch (error) {
      console.error('❌ Resend OTP error:', error);
      throw new Error(handleApiError(error));
    }
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      console.log('🔐 Calling login API');
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      console.log('✅ Login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw new Error(handleApiError(error));
    }
  },

  // Verify 2FA
  verify2FA: async (email: string, otp: string): Promise<AuthResponse> => {
    try {
      console.log('🔐 Calling verify 2FA API');
      const response = await apiClient.post<AuthResponse>('/auth/verify-2fa', { email, otp });
      console.log('✅ Verify 2FA response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Verify 2FA error:', error);
      throw new Error(handleApiError(error));
    }
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<void> => {
    try {
      console.log('📧 Calling forgot password API for:', email);
      console.log('🔗 API URL:', `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`);
      
      const response = await apiClient.post('/auth/forgot-password', { email });
      
      console.log('✅ Forgot password response:', response.data);
    } catch (error: any) {
      console.error('❌ Forgot password error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      throw new Error(handleApiError(error));
    }
  },

  // Reset password
  resetPassword: async (token: string, password: string): Promise<void> => {
    try {
      console.log('🔄 Calling reset password API');
      const response = await apiClient.post('/auth/reset-password', { token, password });
      console.log('✅ Reset password response:', response.data);
    } catch (error) {
      console.error('❌ Reset password error:', error);
      throw new Error(handleApiError(error));
    }
  },

  // Add phone number
  addPhone: async (phoneNumber: string): Promise<void> => {
    try {
      console.log('📱 Calling add phone API');
      await apiClient.post('/auth/add-phone', { phoneNumber });
      console.log('✅ Add phone successful');
    } catch (error) {
      console.error('❌ Add phone error:', error);
      throw new Error(handleApiError(error));
    }
  },

  // Verify phone OTP
  verifyPhone: async (phoneNumber: string, otp: string): Promise<void> => {
    try {
      console.log('📱 Calling verify phone API');
      await apiClient.post('/auth/verify-phone', { phoneNumber, otp });
      console.log('✅ Verify phone successful');
    } catch (error) {
      console.error('❌ Verify phone error:', error);
      throw new Error(handleApiError(error));
    }
  },

  // Enable 2FA
  enable2FA: async (): Promise<void> => {
    try {
      console.log('🔐 Calling enable 2FA API');
      await apiClient.post('/auth/enable-2fa');
      console.log('✅ Enable 2FA successful');
    } catch (error) {
      console.error('❌ Enable 2FA error:', error);
      throw new Error(handleApiError(error));
    }
  },

  // Disable 2FA
  disable2FA: async (): Promise<void> => {
    try {
      console.log('🔐 Calling disable 2FA API');
      await apiClient.post('/auth/disable-2fa');
      console.log('✅ Disable 2FA successful');
    } catch (error) {
      console.error('❌ Disable 2FA error:', error);
      throw new Error(handleApiError(error));
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    try {
      console.log('👤 Calling get current user API');
      const response = await apiClient.get<{ user: User }>('/auth/me');
      console.log('✅ Get current user response:', response.data);
      return response.data.user;
    } catch (error) {
      console.error('❌ Get current user error:', error);
      throw new Error(handleApiError(error));
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      console.log('👋 Calling logout API');
      await apiClient.post('/auth/logout');
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw new Error(handleApiError(error));
    }
  },
};

export default authApi;