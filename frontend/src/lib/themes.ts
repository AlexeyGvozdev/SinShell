/**
 * Определения тем для терминала
 */

import type { Theme, ThemeName } from '@/types';

/**
 * Тема по умолчанию - классический зелёный терминал
 */
export const defaultTheme: Theme = {
  name: 'default',
  displayName: 'Default',
  colors: {
    background: '#000000',
    foreground: '#00ff00',
    cursor: '#00ff00',
    selection: 'rgba(0, 255, 0, 0.3)',
    comment: '#808080',
    red: '#ff0000',
    green: '#00ff00',
    yellow: '#ffff00',
    blue: '#0000ff',
    magenta: '#ff00ff',
    cyan: '#00ffff',
    white: '#ffffff',
  },
};

/**
 * Тема Dracula - популярная тёмная тема
 */
export const draculaTheme: Theme = {
  name: 'dracula',
  displayName: 'Dracula',
  colors: {
    background: '#282a36',
    foreground: '#f8f8f2',
    cursor: '#f8f8f2',
    selection: 'rgba(68, 71, 90, 0.5)',
    comment: '#6272a4',
    red: '#ff5555',
    green: '#50fa7b',
    yellow: '#f1fa8c',
    blue: '#bd93f9',
    magenta: '#ff79c6',
    cyan: '#8be9fd',
    white: '#f8f8f2',
  },
};

/**
 * Тема Monokai - классическая тема для редакторов
 */
export const monokaiTheme: Theme = {
  name: 'monokai',
  displayName: 'Monokai',
  colors: {
    background: '#272822',
    foreground: '#f8f8f2',
    cursor: '#f8f8f0',
    selection: 'rgba(73, 72, 62, 0.5)',
    comment: '#75715e',
    red: '#f92672',
    green: '#a6e22e',
    yellow: '#e6db74',
    blue: '#66d9ef',
    magenta: '#ae81ff',
    cyan: '#a1efe4',
    white: '#f8f8f2',
  },
};

/**
 * Тема Nord - минималистичная северная тема
 */
export const nordTheme: Theme = {
  name: 'nord',
  displayName: 'Nord',
  colors: {
    background: '#2e3440',
    foreground: '#d8dee9',
    cursor: '#d8dee9',
    selection: 'rgba(76, 86, 106, 0.5)',
    comment: '#616e88',
    red: '#bf616a',
    green: '#a3be8c',
    yellow: '#ebcb8b',
    blue: '#81a1c1',
    magenta: '#b48ead',
    cyan: '#88c0d0',
    white: '#e5e9f0',
  },
};

/**
 * Все доступные темы
 */
export const themes: Record<ThemeName, Theme> = {
  default: defaultTheme,
  dracula: draculaTheme,
  monokai: monokaiTheme,
  nord: nordTheme,
};

/**
 * Получить тему по имени
 */
export function getTheme(name: ThemeName): Theme {
  return themes[name] || defaultTheme;
}

/**
 * Получить список всех доступных тем
 */
export function getAvailableThemes(): ThemeName[] {
  return Object.keys(themes) as ThemeName[];
}

/**
 * Применить тему к документу
 */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  
  root.style.setProperty('--terminal-bg', theme.colors.background);
  root.style.setProperty('--terminal-fg', theme.colors.foreground);
  root.style.setProperty('--terminal-cursor', theme.colors.cursor);
  root.style.setProperty('--terminal-selection', theme.colors.selection);
  root.style.setProperty('--terminal-comment', theme.colors.comment);
  root.style.setProperty('--terminal-red', theme.colors.red);
  root.style.setProperty('--terminal-green', theme.colors.green);
  root.style.setProperty('--terminal-yellow', theme.colors.yellow);
  root.style.setProperty('--terminal-blue', theme.colors.blue);
  root.style.setProperty('--terminal-magenta', theme.colors.magenta);
  root.style.setProperty('--terminal-cyan', theme.colors.cyan);
  root.style.setProperty('--terminal-white', theme.colors.white);
}