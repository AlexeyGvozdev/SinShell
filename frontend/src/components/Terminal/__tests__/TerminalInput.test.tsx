/**
 * Тесты для компонента TerminalInput
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TerminalInput } from '../TerminalInput';

describe('TerminalInput', () => {
  const mockOnChange = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockOnKeyDown = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('должен рендериться без ошибок', () => {
    render(
      <TerminalInput
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />
    );
    
    expect(screen.getByTestId('terminal-input')).toBeInTheDocument();
  });

  it('должен отображать текущее значение', () => {
    render(
      <TerminalInput
        value="test command"
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />
    );
    
    const input = screen.getByTestId('terminal-input') as HTMLInputElement;
    expect(input.value).toBe('test command');
  });

  it('должен вызывать onChange при вводе текста', () => {
    render(
      <TerminalInput
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />
    );
    
    const input = screen.getByTestId('terminal-input');
    fireEvent.change(input, { target: { value: 'new text' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('new text');
  });

  it('должен вызывать onSubmit при нажатии Enter', () => {
    render(
      <TerminalInput
        value="test command"
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />
    );
    
    const input = screen.getByTestId('terminal-input');
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
    
    expect(mockOnSubmit).toHaveBeenCalledWith('test command');
  });

  it('не должен вызывать onSubmit при нажатии Shift+Enter', () => {
    render(
      <TerminalInput
        value="test command"
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />
    );
    
    const input = screen.getByTestId('terminal-input');
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('не должен вызывать onSubmit для пустой команды', () => {
    render(
      <TerminalInput
        value="   "
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />
    );
    
    const input = screen.getByTestId('terminal-input');
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('должен вызывать кастомный onKeyDown обработчик', () => {
    render(
      <TerminalInput
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        onKeyDown={mockOnKeyDown}
      />
    );
    
    const input = screen.getByTestId('terminal-input');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    
    expect(mockOnKeyDown).toHaveBeenCalled();
  });

  it('должен быть disabled когда передан prop disabled', () => {
    render(
      <TerminalInput
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        disabled
      />
    );
    
    const input = screen.getByTestId('terminal-input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('должен отображать placeholder', () => {
    const placeholder = 'Введите команду...';
    render(
      <TerminalInput
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        placeholder={placeholder}
      />
    );
    
    const input = screen.getByTestId('terminal-input');
    expect(input).toHaveAttribute('placeholder', placeholder);
  });

  it('должен применять кастомный className', () => {
    const { container } = render(
      <TerminalInput
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        className="custom-class"
      />
    );
    
    const wrapper = container.querySelector('.terminal-input-wrapper');
    expect(wrapper).toHaveClass('custom-class');
  });

  it('должен иметь правильные атрибуты для автозаполнения', () => {
    render(
      <TerminalInput
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />
    );
    
    const input = screen.getByTestId('terminal-input');
    expect(input).toHaveAttribute('spellCheck', 'false');
    expect(input).toHaveAttribute('autoComplete', 'off');
    expect(input).toHaveAttribute('autoCorrect', 'off');
    expect(input).toHaveAttribute('autoCapitalize', 'off');
  });

  it('должен иметь правильный ARIA label', () => {
    render(
      <TerminalInput
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />
    );
    
    const input = screen.getByTestId('terminal-input');
    expect(input).toHaveAttribute('aria-label', 'Ввод команды терминала');
  });

  it('должен отображать промпт', () => {
    const { container } = render(
      <TerminalInput
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />
    );
    
    const prompt = container.querySelector('.terminal-prompt');
    expect(prompt).toBeInTheDocument();
    expect(prompt).toHaveTextContent('$');
  });
});