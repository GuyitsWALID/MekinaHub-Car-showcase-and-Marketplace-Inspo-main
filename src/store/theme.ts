// src/store/theme.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleTheme: () =>
        set((state) => {
          const next = !state.isDarkMode;
          // Apply the class immediately
          document.documentElement.classList.toggle('dark', next);
          return { isDarkMode: next };
        }),
    }),
    {
      name: 'theme-storage',
      // On rehydrate (initial load), sync the class once:
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.classList.toggle('dark', state.isDarkMode);
        }
      },
    }
  )
);
