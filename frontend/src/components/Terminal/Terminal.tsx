/**
 * Главный компонент терминала
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TerminalInput } from './TerminalInput';
import { TerminalOutput } from './TerminalOutput';
import { HistoryEntry } from '@/types';
import { useTheme } from '@/context/ThemeContext';

export interface TerminalProps {
  onCommand?: (command: string) => Promise<React.ReactNode>;
  welcomeMessage?: React.ReactNode;
  className?: string;
}

/**
 * Главный компонент Terminal
 * Управляет состоянием терминала, историей команд и вводом
 */
export const Terminal: React.FC<TerminalProps> = ({
  onCommand,
  welcomeMessage,
  className = '',
}) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const { currentTheme } = useTheme();

  // Добавляем приветственное сообщение при монтировании
  useEffect(() => {
    if (welcomeMessage) {
      const welcomeEntry: HistoryEntry = {
        id: `welcome-${Date.now()}`,
        command: '',
        output: welcomeMessage,
        timestamp: new Date(),
        type: 'output',
      };
      setHistory([welcomeEntry]);
    }
  }, [welcomeMessage]);

  // Автоскролл к низу при добавлении новых записей
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Добавление записи в историю
  const addToHistory = useCallback((entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: `entry-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    };
    setHistory((prev) => [...prev, newEntry]);
  }, []);

  // Выполнение команды
  const executeCommand = useCallback(
    async (command: string) => {
      if (!command.trim()) return;

      setIsProcessing(true);

      // Добавляем команду в историю
      addToHistory({
        command,
        output: null,
        type: 'command',
      });

      try {
        // Выполняем команду через callback
        let output: React.ReactNode = null;
        if (onCommand) {
          output = await onCommand(command);
        }

        // Добавляем результат в историю
        if (output) {
          addToHistory({
            command: '',
            output,
            type: 'output',
          });
        }
      } catch (error) {
        // Добавляем ошибку в историю
        addToHistory({
          command: '',
          output: error instanceof Error ? error.message : 'Произошла ошибка',
          type: 'error',
        });
      } finally {
        setIsProcessing(false);
        setCurrentInput('');
      }
    },
    [onCommand, addToHistory]
  );

  // Очистка истории
  const clearHistory = useCallback(() => {
    setHistory([]);
    if (welcomeMessage) {
      const welcomeEntry: HistoryEntry = {
        id: `welcome-${Date.now()}`,
        command: '',
        output: welcomeMessage,
        timestamp: new Date(),
        type: 'output',
      };
      setHistory([welcomeEntry]);
    }
  }, [welcomeMessage]);

  return (
    <div
      ref={terminalRef}
      className={`terminal ${className}`}
      data-theme={currentTheme.name}
      data-testid="terminal"
      role="application"
      aria-label="Терминал"
    >
      <div className="terminal-content">
        <TerminalOutput entries={history} />
        <TerminalInput
          value={currentInput}
          onChange={setCurrentInput}
          onSubmit={executeCommand}
          disabled={isProcessing}
          autoFocus
        />
      </div>
    </div>
  );
};

Terminal.displayName = 'Terminal';