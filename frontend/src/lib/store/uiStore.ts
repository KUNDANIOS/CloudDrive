import { create } from 'zustand';
import { UIState } from '../types';

export const useUIStore = create<UIState>((set) => ({
  isDarkMode: false,
  sidebarOpen: true,
  activeModal: null,
  modalData: null,

  toggleDarkMode: () =>
    set((state) => {
      const newMode = !state.isDarkMode;
      if (typeof window !== 'undefined') {
        localStorage.setItem('darkMode', newMode.toString());
        if (newMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      return { isDarkMode: newMode };
    }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  openModal: (modal, data) => set({ activeModal: modal, modalData: data }),

  closeModal: () => set({ activeModal: null, modalData: null }),
}));