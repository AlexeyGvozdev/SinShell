/**
 * Компонент для ввода команд в терминале
 */

import React, { useRef, useEffect, KeyboardEvent } from 'react';

export interface TerminalInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (command: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

/**
 * Компонент TerminalInput для ввода команд
 * Поддерживает автофокус, обработку Enter и кастомные обработчики клавиш
 */
export const TerminalInput: React.FC<TerminalInputProps> = ({
  value,
  onChange,
  onSubmit,
  onKeyDown,
  disabled = false,
  placeholder = 'Введите команду...',
  autoFocus = true,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Автофокус при монтировании
  useEffect(() => {
    if (autoFocus && inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [autoFocus, disabled]);

  // Обработка нажатия клавиш
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // Вызываем кастомный обработчик если есть
    if (onKeyDown) {
      onKeyDown(event);
    }

    // Обработка Enter
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const trimmedValue = value.trim();
      if (trimmedValue) {
        onSubmit(trimmedValue);
      }
    }
  };

  // Обработка изменения значения
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className={`terminal-input-wrapper ${className}`}>
      <span className="terminal-prompt" aria-hidden="true">
        $
      </span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className="terminal-input"
        aria-label="Ввод команды терминала"
        data-testid="terminal-input"
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
    </div>
  );
};

TerminalInput.displayName = 'TerminalInput';