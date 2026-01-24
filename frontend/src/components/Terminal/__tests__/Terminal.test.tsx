/**
 * Тесты для главного компонента Terminal
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Terminal } from '../Terminal';
import { ThemeProvider } from '@/context/ThemeContext';

// Wrapper для тестов с ThemeProvider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('Terminal', () => {
  it('должен рендериться без ошибок', () => {
    renderWithTheme(<Terminal />);
    expect(screen.getByTestId('terminal')).toBeInTheDocument();
  });

  it('должен иметь правильные ARIA атрибуты', () => {
    renderWithTheme(<Terminal />);
    const terminal = screen.getByTestId('terminal');
    expect(terminal).toHaveAttribute('role', 'application');
    expect(terminal).toHaveAttribute('aria-label', 'Терминал');
  });

  it('должен отображать приветственное сообщение', () => {
    const welcomeMessage = 'Добро пожаловать в терминал!';
    renderWithTheme(<Terminal welcomeMessage={welcomeMessage} />);
    
    expect(screen.getByText(welcomeMessage)).toBeInTheDocument();
  });

  it('должен отображать input для ввода команд', () => {
    renderWithTheme(<Terminal />);
    expect(screen.getByTestId('terminal-input')).toBeInTheDocument();
  });

  it('должен обновлять значение input при вводе', () => {
    renderWithTheme(<Terminal />);
    const input = screen.getByTestId('terminal-input') as HTMLInputElement;
    
    fireEvent.change(input, { target: { value: 'test command' } });
    expect(input.value).toBe('test command');
  });

  it('должен выполнять команду при нажатии Enter', async () => {
    const mockOnCommand = jest.fn().mockResolvedValue('Command output');
    renderWithTheme(<Terminal onCommand={mockOnCommand} />);
    
    const input = screen.getByTestId('terminal-input');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(mockOnCommand).toHaveBeenCalledWith('test');
    });
  });

  it('должен очищать input после выполнения команды', async () => {
    const mockOnCommand = jest.fn().mockResolvedValue('Output');
    renderWithTheme(<Terminal onCommand={mockOnCommand} />);
    
    const input = screen.getByTestId('terminal-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('должен добавлять команду в историю', async () => {
    const mockOnCommand = jest.fn().mockResolvedValue('Output');
    renderWithTheme(<Terminal onCommand={mockOnCommand} />);
    
    const input = screen.getByTestId('terminal-input');
    fireEvent.change(input, { target: { value: 'ls' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(screen.getByText('ls')).toBeInTheDocument();
    });
  });

  it('должен добавлять вывод команды в историю', async () => {
    const mockOnCommand = jest.fn().mockResolvedValue('Command result');
    renderWithTheme(<Terminal onCommand={mockOnCommand} />);
    
    const input = screen.getByTestId('terminal-input');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(screen.getByText('Command result')).toBeInTheDocument();
    });
  });

  it('должен отображать ошибки в истории', async () => {
    const mockOnCommand = jest.fn().mockRejectedValue(new Error('Command failed'));
    renderWithTheme(<Terminal onCommand={mockOnCommand} />);
    
    const input = screen.getByTestId('terminal-input');
    fireEvent.change(input, { target: { value: 'error' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(screen.getByText('Command failed')).toBeInTheDocument();
    });
  });

  it('должен блокировать input во время обработки команды', async () => {
    const mockOnCommand = jest.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve('Done'), 100))
    );
    renderWithTheme(<Terminal onCommand={mockOnCommand} />);
    
    const input = screen.getByTestId('terminal-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    // Input должен быть disabled во время обработки
    expect(input.disabled).toBe(true);
    
    await waitFor(() => {
      expect(input.disabled).toBe(false);
    });
  });

  it('не должен выполнять пустую команду', async () => {
    const mockOnCommand = jest.fn();
    renderWithTheme(<Terminal onCommand={mockOnCommand} />);
    
    const input = screen.getByTestId('terminal-input');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(mockOnCommand).not.toHaveBeenCalled();
    });
  });

  it('должен применять кастомный className', () => {
    renderWithTheme(<Terminal className="custom-terminal" />);
    const terminal = screen.getByTestId('terminal');
    expect(terminal).toHaveClass('custom-terminal');
  });

  it('должен отображать React элементы в выводе команды', async () => {
    const mockOnCommand = jest.fn().mockResolvedValue(
      <div data-testid="custom-output">Custom Output</div>
    );
    renderWithTheme(<Terminal onCommand={mockOnCommand} />);
    
    const input = screen.getByTestId('terminal-input');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(screen.getByTestId('custom-output')).toBeInTheDocument();
      expect(screen.getByText('Custom Output')).toBeInTheDocument();
    });
  });

  it('должен сохранять приветственное сообщение после очистки истории', async () => {
    const welcomeMessage = 'Welcome!';
    const mockOnCommand = jest.fn().mockResolvedValue('Output');
    renderWithTheme(<Terminal welcomeMessage={welcomeMessage} onCommand={mockOnCommand} />);
    
    // Выполняем команду
    const input = screen.getByTestId('terminal-input');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(screen.getByText('test')).toBeInTheDocument();
    });
    
    // Приветственное сообщение должно остаться
    expect(screen.getByText(welcomeMessage)).toBeInTheDocument();
  });

  it('должен иметь атрибут data-theme', () => {
    renderWithTheme(<Terminal />);
    const terminal = screen.getByTestId('terminal');
    expect(terminal).toHaveAttribute('data-theme');
  });

  it('должен отображать несколько команд в истории', async () => {
    const mockOnCommand = jest.fn()
      .mockResolvedValueOnce('Output 1')
      .mockResolvedValueOnce('Output 2');
    
    renderWithTheme(<Terminal onCommand={mockOnCommand} />);
    
    const input = screen.getByTestId('terminal-input');
    
    // Первая команда
    fireEvent.change(input, { target: { value: 'cmd1' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(screen.getByText('cmd1')).toBeInTheDocument();
      expect(screen.getByText('Output 1')).toBeInTheDocument();
    });
    
    // Вторая команда
    fireEvent.change(input, { target: { value: 'cmd2' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(screen.getByText('cmd2')).toBeInTheDocument();
      expect(screen.getByText('Output 2')).toBeInTheDocument();
    });
  });

  describe('навигация по истории команд', () => {
    it('должен обрабатывать навигацию вверх по истории', async () => {
      const mockOnCommand = jest.fn().mockResolvedValue('Output');
      renderWithTheme(<Terminal onCommand={mockOnCommand} />);
      
      const input = screen.getByTestId('terminal-input') as HTMLInputElement;
      
      // Выполняем команду для добавления в историю
      fireEvent.change(input, { target: { value: 'test-command' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      await waitFor(() => {
        expect(input.value).toBe('');
      });
      
      // Нажимаем стрелку вверх для навигации по истории
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      
      // Значение должно измениться на последнюю команду из истории
      expect(input.value).toBe('test-command');
    });

    it('должен обрабатывать навигацию вниз по истории', async () => {
      const mockOnCommand = jest.fn().mockResolvedValue('Output');
      renderWithTheme(<Terminal onCommand={mockOnCommand} />);
      
      const input = screen.getByTestId('terminal-input') as HTMLInputElement;
      
      // Выполняем команду для добавления в историю
      fireEvent.change(input, { target: { value: 'test-command' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      await waitFor(() => {
        expect(input.value).toBe('');
      });
      
      // Нажимаем стрелку вверх для перехода к истории
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      expect(input.value).toBe('test-command');
      
      // Нажимаем стрелку вниз для возврата
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(input.value).toBe('');
    });

    it('должен сбрасывать навигацию при вводе нового текста', async () => {
      const mockOnCommand = jest.fn().mockResolvedValue('Output');
      renderWithTheme(<Terminal onCommand={mockOnCommand} />);
      
      const input = screen.getByTestId('terminal-input') as HTMLInputElement;
      
      // Выполняем команду для добавления в историю
      fireEvent.change(input, { target: { value: 'test-command' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      await waitFor(() => {
        expect(input.value).toBe('');
      });
      
      // Нажимаем стрелку вверх для перехода к истории
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      expect(input.value).toBe('test-command');
      
      // Вводим новый текст - навигация должна сброситься
      fireEvent.change(input, { target: { value: 'new-text' } });
      
      // Нажимаем стрелку вверх снова - должно перейти к последней команде
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      expect(input.value).toBe('test-command');
    });

    it('должен обрабатывать навигацию по истории корректно', async () => {
      const mockOnCommand = jest.fn().mockResolvedValue('Output');
      renderWithTheme(<Terminal onCommand={mockOnCommand} />);
      
      const input = screen.getByTestId('terminal-input');
      
      // Выполняем команду для добавления в историю
      fireEvent.change(input, { target: { value: 'test-command' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('test-command')).toBeInTheDocument();
      });
      
      // Нажимаем стрелку вверх - должно восстановить команду из истории
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      
      // Значение должно измениться на последнюю команду из истории
      expect((input as HTMLInputElement).value).toBe('test-command');
    });

    it('должен корректно обрабатывать пустую историю', () => {
      renderWithTheme(<Terminal />);
      
      const input = screen.getByTestId('terminal-input') as HTMLInputElement;
      
      // Нажимаем стрелки в пустой истории
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      expect(input.value).toBe('');
      
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(input.value).toBe('');
    });

    it('должен корректно обрабатывать несколько команд в истории', async () => {
      const mockOnCommand = jest.fn()
        .mockResolvedValueOnce('Output 1')
        .mockResolvedValueOnce('Output 2')
        .mockResolvedValueOnce('Output 3');
      
      renderWithTheme(<Terminal onCommand={mockOnCommand} />);
      
      const input = screen.getByTestId('terminal-input') as HTMLInputElement;
      
      // Добавляем несколько команд в историю
      const commands = ['cmd1', 'cmd2', 'cmd3'];
      
      for (const cmd of commands) {
        fireEvent.change(input, { target: { value: cmd } });
        fireEvent.keyDown(input, { key: 'Enter' });
        
        await waitFor(() => {
          expect(input.value).toBe('');
        });
      }
      
      // Навигация по истории: должны получать команды в обратном порядке
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      expect(input.value).toBe('cmd3');
      
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      expect(input.value).toBe('cmd2');
      
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      expect(input.value).toBe('cmd1');
      
      // Дальнейшая навигация вверх не должна изменять значение
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      expect(input.value).toBe('cmd1');
      
      // Навигация вниз
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(input.value).toBe('cmd2');
      
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(input.value).toBe('cmd3');
      
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(input.value).toBe('');
    });
  });
});