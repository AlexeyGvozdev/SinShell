import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { defaultTheme, draculaTheme } from '@/lib/themes';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('ThemeProvider', () => {
    it('provides default theme initially', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.themeName).toBe('default');
      expect(result.current.currentTheme).toEqual(defaultTheme);
    });

    it('loads theme from localStorage if available', () => {
      localStorageMock.setItem('sinshell-theme', 'dracula');

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.themeName).toBe('dracula');
      expect(result.current.currentTheme).toEqual(draculaTheme);
    });

    it('provides list of available themes', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.availableThemes).toContain('default');
      expect(result.current.availableThemes).toContain('dracula');
      expect(result.current.availableThemes).toContain('monokai');
      expect(result.current.availableThemes).toContain('nord');
    });
  });

  describe('useTheme hook', () => {
    it('throws error when used outside ThemeProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useTheme());
      }).toThrow('useTheme must be used within a ThemeProvider');

      consoleSpy.mockRestore();
    });

    it('allows changing theme', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setTheme('dracula');
      });

      expect(result.current.themeName).toBe('dracula');
      expect(result.current.currentTheme).toEqual(draculaTheme);
    });

    it('saves theme to localStorage when changed', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setTheme('monokai');
      });

      expect(localStorageMock.getItem('sinshell-theme')).toBe('monokai');
    });
  });

  describe('Theme application', () => {
    it('applies theme on mount', () => {
      const setPropertySpy = jest.spyOn(document.documentElement.style, 'setProperty');

      renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      expect(setPropertySpy).toHaveBeenCalled();
      expect(setPropertySpy).toHaveBeenCalledWith('--terminal-bg', expect.any(String));
    });

    it('applies theme when changed', () => {
      const setPropertySpy = jest.spyOn(document.documentElement.style, 'setProperty');

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider,
      });

      setPropertySpy.mockClear();

      act(() => {
        result.current.setTheme('dracula');
      });

      expect(setPropertySpy).toHaveBeenCalled();
      expect(setPropertySpy).toHaveBeenCalledWith('--terminal-bg', draculaTheme.colors.background);
    });
  });
});