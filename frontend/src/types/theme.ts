/**
 * Типы для системы тем
 */

export interface ThemeColors {
  background: string;
  foreground: string;
  cursor: string;
  selection: string;
  comment: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
}

export interface Theme {
  name: string;
  displayName: string;
  colors: ThemeColors;
}

export type ThemeName = 'default' | 'dracula' | 'monokai' | 'nord';

export interface ThemeContextType {
  currentTheme: Theme;
  themeName: ThemeName;
  setTheme: (themeName: ThemeName) => void;
  availableThemes: ThemeName[];
}