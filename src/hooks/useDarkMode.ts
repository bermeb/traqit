/**
 * useDarkMode Hook
 * Manages dark mode state with localStorage persistence
 */

import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'traqit-theme';

export function useDarkMode() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored) return stored;

    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  });

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setLightMode = () => setTheme('light');
  const setDarkMode = () => setTheme('dark');

  return {
    theme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    toggleTheme,
    setLightMode,
    setDarkMode,
  };
}
