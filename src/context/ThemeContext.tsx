import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemePreset, ThemeMode } from '../types';

interface ThemeContextType {
  mode: ThemeMode;
  preset: ThemePreset;
  setMode: (mode: ThemeMode) => void;
  setPreset: (preset: ThemePreset) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('foodlink_theme_mode') as ThemeMode;
    if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system') return savedMode;
    return 'system';
  });

  const [preset, setPresetState] = useState<ThemePreset>(() => {
    const savedPreset = localStorage.getItem('foodlink_theme_preset') as ThemePreset;
    const validPresets: ThemePreset[] = ['food-green', 'ocean-blue', 'royal-purple', 'sunset', 'teal-mint', 'midnight'];
    return validPresets.includes(savedPreset) ? savedPreset : 'food-green';
  });

  useEffect(() => {
    const root = document.documentElement;

    const applyMode = () => {
      let isDark = false;
      if (mode === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        isDark = mode === 'dark';
      }

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyMode();
    localStorage.setItem('foodlink_theme_mode', mode);

    // Apply Preset attribute
    root.setAttribute('data-theme-preset', preset);
    localStorage.setItem('foodlink_theme_preset', preset);

    let listener: (() => void) | null = null;
    let mediaQuery: MediaQueryList | null = null;

    if (mode === 'system') {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      listener = () => applyMode();
      mediaQuery.addEventListener('change', listener);
    }

    return () => {
      if (mediaQuery && listener) {
        mediaQuery.removeEventListener('change', listener);
      }
    };
  }, [mode, preset]);

  const setMode = (newMode: ThemeMode) => setModeState(newMode);
  const setPreset = (newPreset: ThemePreset) => setPresetState(newPreset);
  const toggleMode = () => setModeState((prev) => (prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light'));

  return (
    <ThemeContext.Provider value={{ mode, preset, setMode, setPreset, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
