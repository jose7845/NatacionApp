import { create } from 'zustand';
import type { ThemeMode } from '@/types';

interface ThemeState {
  mode: ThemeMode;
  toggle: () => void;
  initialize: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'dark',
  
  initialize: () => {
    const stored = localStorage.getItem('theme') as ThemeMode | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const mode = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', mode === 'dark');
    set({ mode });
  },

  toggle: () => {
    set((state) => {
      const newMode = state.mode === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newMode);
      document.documentElement.classList.toggle('dark', newMode === 'dark');
      return { mode: newMode };
    });
  },
}));
