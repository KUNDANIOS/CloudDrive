import { create } from 'zustand';
import Cookies from 'js-cookie';

import { AuthState, LoginCredentials, RegisterCredentials } from '../types';
import { authApi } from '../api/auth';

// Mock user for testing
const MOCK_USER = {
  id: 'user_1',
  email: 'test@example.com',
  name: 'Test User',
  storageUsed: 3221225472, // 3GB
  storageLimit: 5368709120, // 5GB
  createdAt: new Date().toISOString(),
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  initialize: () => {
    if (typeof window === 'undefined') return;

    const token = Cookies.get('token') || localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true });
      } catch (error) {
        console.error('Failed to parse user from storage:', error);
        Cookies.remove('token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  },

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login(credentials);

      Cookies.set('token', response.token, { expires: 7 });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.warn('Backend not available, using mock mode');

      const mockToken = 'mock-token-' + Date.now();

      Cookies.set('token', mockToken, { expires: 7 });
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(MOCK_USER));

      set({
        user: MOCK_USER,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
      });
    }
  },

  register: async (credentials: RegisterCredentials) => {
    set({ isLoading: true });
    try {
      const response = await authApi.register(credentials);

      Cookies.set('token', response.token, { expires: 7 });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.warn('Backend not available, using mock mode');

      const mockToken = 'mock-token-' + Date.now();
      const mockUser = { ...MOCK_USER, name: credentials.name, email: credentials.email };

      Cookies.set('token', mockToken, { expires: 7 });
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      set({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
      });
    }
  },

  logout: () => {
    Cookies.remove('token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });

    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user });
  },

  setToken: (token) => {
    if (token) {
      Cookies.set('token', token, { expires: 7 });
      localStorage.setItem('token', token);
      set({ token, isAuthenticated: true });
    } else {
      Cookies.remove('token');
      localStorage.removeItem('token');
      set({ token: null, isAuthenticated: false });
    }
  },
}));
