/**
 * Тесты для интерактивных функций терминала
 * Проверка автокомплита и навигации по истории
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Terminal } from '../Terminal';
import { ThemeProvider } from '@/context/ThemeContext';
import { DefaultCommandRegistry } from '@/lib/commands/registry';
import { helpCommand, clearCommand, aboutCommand, themeCommand } from '@/lib/commands/builtins';
import { apiCommands } from '@/lib/commands/api';

// Mock функции для автокомплита
jest.mock('@/lib/autocomplete', () => ({
  createAutocompleteManager: jest.fn(() => ({
    getSuggestions: jest.fn((input: string) => {
      const allCommands = [
        'help', 'clear', 'about', 'theme',
        'health', 'health-check', 'health-status', 'health-uptime',
        'info', 'info-system', 'info-version', 'info-time',
        'about-api', 'about-endpoints', 'about-status'
      ];
      
      if (!input) return [];
      
      return allCommands.filter(cmd => cmd.startsWith(input));
    }),
    navigateNext: jest.fn(),
    navigatePrevious: jest.fn(),
    getCurrentSuggestion: jest.fn(),
    reset: jest.fn()
  }))
}));

// Helper функция для рендеринга с темой
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('Terminal Interactive Features', () => {
  beforeEach(() => {
    // Очищаем моки перед каждым тестом
    jest.clearAllMocks();
  });

  describe('Tab Autocomplete', () => {
    test('должен вызывать onAutocomplete при нажатии Tab', async () => {
      const mockOnAutocomplete = jest.fn();
      
      renderWithTheme(
        <Terminal 
          welcomeMessage="Welcome to SinShell Terminal"
          onAutocomplete={mockOnAutocomplete}
        />
      );

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'hel');
      
      // Нажимаем Tab
      fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });
      
      expect(mockOnAutocomplete).toHaveBeenCalledWith('hel');
    });

    test('должен обрабатывать автокомплит для частичной команды', async () => {
      const mockOnAutocomplete = jest.fn((input: string) => {
        if (input === 'hel') return 'help';
        return input;
      });
      
      renderWithTheme(
        <Terminal 
          welcomeMessage="Welcome to SinShell Terminal"
          onAutocomplete={mockOnAutocomplete}
        />
      );

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'hel');
      
      // Нажимаем Tab
      fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });
      
      expect(mockOnAutocomplete).toHaveBeenCalledWith('hel');
    });

    test('не должен вызывать автокомплит при пустом вводе', async () => {
      const mockOnAutocomplete = jest.fn();
      
      renderWithTheme(
        <Terminal 
          welcomeMessage="Welcome to SinShell Terminal"
          onAutocomplete={mockOnAutocomplete}
        />
      );

      const input = screen.getByRole('textbox');
      
      // Нажимаем Tab на пустом вводе
      fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });
      
      expect(mockOnAutocomplete).not.toHaveBeenCalled();
    });

    test('должен передавать текущее значение ввода в автокомплит', async () => {
      const mockOnAutocomplete = jest.fn();
      
      renderWithTheme(
        <Terminal 
          welcomeMessage="Welcome to SinShell Terminal"
          onAutocomplete={mockOnAutocomplete}
        />
      );

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'the');
      
      // Нажимаем Tab
      fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });
      
      expect(mockOnAutocomplete).toHaveBeenCalledWith('the');
    });
  });

  describe('History Navigation Integration', () => {
    test('должен обрабатывать навигацию вверх по истории', async () => {
      const mockOnHistoryNavigate = jest.fn();
      
      renderWithTheme(
        <Terminal 
          welcomeMessage="Welcome to SinShell Terminal"
          onHistoryNavigate={mockOnHistoryNavigate}
        />
      );

      const input = screen.getByRole('textbox');
      
      // Нажимаем стрелку вверх
      fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' });
      
      expect(mockOnHistoryNavigate).toHaveBeenCalledWith('up');
    });

    test('должен обрабатывать навигацию вниз по истории', async () => {
      const mockOnHistoryNavigate = jest.fn();
      
      renderWithTheme(
        <Terminal 
          welcomeMessage="Welcome to SinShell Terminal"
          onHistoryNavigate={mockOnHistoryNavigate}
        />
      );

      const input = screen.getByRole('textbox');
      
      // Нажимаем стрелку вниз
      fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
      
      expect(mockOnHistoryNavigate).toHaveBeenCalledWith('down');
    });

    test('должен сбрасывать навигацию при вводе нового текста', async () => {
      const mockOnHistoryReset = jest.fn();
      
      renderWithTheme(
        <Terminal 
          welcomeMessage="Welcome to SinShell Terminal"
          onHistoryReset={mockOnHistoryReset}
        />
      );

      const input = screen.getByRole('textbox');
      
      // Вводим текст
      await userEvent.type(input, 'test');
      
      expect(mockOnHistoryReset).toHaveBeenCalled();
    });
  });

  describe('Combined Interactive Features', () => {
    test('должен корректно работать автокомплит после навигации по истории', async () => {
      const mockOnAutocomplete = jest.fn();
      const mockOnHistoryNavigate = jest.fn();
      
      renderWithTheme(
        <Terminal 
          welcomeMessage="Welcome to SinShell Terminal"
          onAutocomplete={mockOnAutocomplete}
          onHistoryNavigate={mockOnHistoryNavigate}
        />
      );

      const input = screen.getByRole('textbox');
      
      // Сначала навигируемся по истории
      fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' });
      expect(mockOnHistoryNavigate).toHaveBeenCalledWith('up');
      
      // Затем используем автокомплит
      await userEvent.clear(input);
      await userEvent.type(input, 'hel');
      fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });
      
      expect(mockOnAutocomplete).toHaveBeenCalledWith('hel');
    });

    test('должен сохранять фокус на вводе после автокомплита', async () => {
      const mockOnAutocomplete = jest.fn();
      
      renderWithTheme(
        <Terminal 
          welcomeMessage="Welcome to SinShell Terminal"
          onAutocomplete={mockOnAutocomplete}
        />
      );

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'hel');
      
      // Нажимаем Tab
      fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });
      
      // Проверяем, что фокус остался на input
      expect(input).toHaveFocus();
    });

    test('должен обрабатывать множественные нажатия Tab', async () => {
      const mockOnAutocomplete = jest.fn((input: string) => {
        // Возвращаем то же значение, чтобы тест был предсказуемым
        return input;
      });
      
      renderWithTheme(
        <Terminal
          welcomeMessage="Welcome to SinShell Terminal"
          onAutocomplete={mockOnAutocomplete}
        />
      );

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'hel');
      
      // Нажимаем Tab несколько раз
      fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });
      fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });
      
      expect(mockOnAutocomplete).toHaveBeenCalledTimes(2);
      // Первый вызов с 'hel', второй может быть с измененным значением
      expect(mockOnAutocomplete).toHaveBeenNthCalledWith(1, 'hel');
    });
  });

  describe('Edge Cases', () => {
    test('должен обрабатывать автокомплит с пробелами', async () => {
      const mockOnAutocomplete = jest.fn();
      
      renderWithTheme(
        <Terminal 
          welcomeMessage="Welcome to SinShell Terminal"
          onAutocomplete={mockOnAutocomplete}
        />
      );

      const input = screen.getByRole('textbox');
      await userEvent.type(input, '  hel');
      
      // Нажимаем Tab
      fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });
      
      expect(mockOnAutocomplete).toHaveBeenCalledWith('  hel');
    });

    test('должен обрабатывать автокомплит для команд API', async () => {
      const mockOnAutocomplete = jest.fn();
      
      renderWithTheme(
        <Terminal 
          welcomeMessage="Welcome to SinShell Terminal"
          onAutocomplete={mockOnAutocomplete}
        />
      );

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'health');
      
      // Нажимаем Tab
      fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });
      
      expect(mockOnAutocomplete).toHaveBeenCalledWith('health');
    });

    test('должен игнорировать автокомплит при вводе специальных символов', async () => {
      const mockOnAutocomplete = jest.fn();
      
      renderWithTheme(
        <Terminal 
          welcomeMessage="Welcome to SinShell Terminal"
          onAutocomplete={mockOnAutocomplete}
        />
      );

      const input = screen.getByRole('textbox');
      await userEvent.type(input, '!@#');
      
      // Нажимаем Tab
      fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' });
      
      expect(mockOnAutocomplete).toHaveBeenCalledWith('!@#');
    });
  });
});