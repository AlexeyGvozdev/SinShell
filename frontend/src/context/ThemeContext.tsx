'use client';

/**
 * Context для управления темами терминала
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Theme, ThemeName, ThemeContextType } from '@/types';
import { getTheme, getAvailableThemes, applyTheme } from '@/lib/themes';
import { getThemeConfig } from '@/lib/config';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'sinshell-theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const defaultThemeName = getThemeConfig().default as ThemeName;
  
  // Инициализировать тему из localStorage или использовать дефолтную
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null;
      if (savedTheme && getAvailableThemes().includes(savedTheme)) {
        return savedTheme;
      }
    }
    return defaultThemeName;
  });
  
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => getTheme(themeName));

  // Применить тему при изменении
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  // Функция для смены темы
  const setTheme = useCallback((newThemeName: ThemeName) => {
    const newTheme = getTheme(newThemeName);
    setThemeName(newThemeName);
    setCurrentTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newThemeName);
  }, []);

  const value: ThemeContextType = {
    currentTheme,
    themeName,
    setTheme,
    availableThemes: getAvailableThemes(),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook для использования темы
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}