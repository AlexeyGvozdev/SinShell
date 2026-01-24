/**
 * Главный компонент терминала
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TerminalInput } from './TerminalInput';
import { TerminalOutput } from './TerminalOutput';
import { HistoryEntry } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { CommandHistory } from '@/lib/history';

export interface TerminalProps {
  onCommand?: (command: string) => Promise<React.ReactNode>;
  welcomeMessage?: React.ReactNode;
  className?: string;
  title?: string;
}

/**
 * Главный компонент Terminal
 * Управляет состоянием терминала, историей команд и вводом
 */
export const Terminal: React.FC<TerminalProps> = ({
  onCommand,
  welcomeMessage,
  className = '',
  title = 'SinShell Terminal',
}) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const { currentTheme } = useTheme();
  
  // Экземпляр истории команд
  const [commandHistory] = useState(() => new CommandHistory(100));

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

      // Добавляем команду в историю отображения
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

        // Добавляем результат в историю отображения
        if (output) {
          addToHistory({
            command: '',
            output,
            type: 'output',
          });
        }

        // Добавляем команду в историю команд с результатом
        const resultText = typeof output === 'string' ? output :
                         output?.toString() || 'Command executed';
        commandHistory.addCommand(command, resultText);
      } catch (error) {
        // Добавляем ошибку в историю отображения
        const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка';
        addToHistory({
          command: '',
          output: errorMessage,
          type: 'error',
        });

        // Добавляем команду в историю команд с ошибкой
        commandHistory.addCommand(command, errorMessage);
      } finally {
        setIsProcessing(false);
        setCurrentInput('');
      }
    },
    [onCommand, addToHistory, commandHistory]
  );

  // Обработчики навигации по истории
  const handleHistoryUp = useCallback(() => {
    return commandHistory.getPreviousCommand();
  }, [commandHistory]);

  const handleHistoryDown = useCallback(() => {
    return commandHistory.getNextCommand();
  }, [commandHistory]);

  const handleResetHistoryNavigation = useCallback(() => {
    commandHistory.resetNavigation();
  }, [commandHistory]);


  return (
    <div
      ref={terminalRef}
      className={`terminal ${className}`}
      data-theme={currentTheme.name}
      data-testid="terminal"
      role="application"
      aria-label="Терминал"
    >
      {/* Terminal Header */}
      <div className="terminal-header">
        <button className="terminal-button close" aria-label="Закрыть" />
        <button className="terminal-button minimize" aria-label="Свернуть" />
        <button className="terminal-button maximize" aria-label="Развернуть" />
        <div className="terminal-title">{title}</div>
      </div>

      {/* Terminal Content */}
      <div className="terminal-content">
        <TerminalOutput entries={history} />
        <TerminalInput
          value={currentInput}
          onChange={setCurrentInput}
          onSubmit={executeCommand}
          disabled={isProcessing}
          autoFocus
          onHistoryUp={handleHistoryUp}
          onHistoryDown={handleHistoryDown}
          onResetHistoryNavigation={handleResetHistoryNavigation}
        />
      </div>
    </div>
  );
};

Terminal.displayName = 'Terminal';