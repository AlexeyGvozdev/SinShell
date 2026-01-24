/**
 * Компонент для отображения одной строки терминала
 */

import React from 'react';

export interface TerminalLineProps {
  type: 'command' | 'output' | 'error' | 'success' | 'info';
  content: React.ReactNode;
  prompt?: boolean;
  className?: string;
}

/**
 * Компонент TerminalLine отображает одну строку в терминале
 * Может быть командой (с промптом) или выводом (без промпта)
 */
export const TerminalLine: React.FC<TerminalLineProps> = ({
  type,
  content,
  prompt = false,
  className = '',
}) => {
  const lineClassName = `terminal-line terminal-line--${type} ${className}`.trim();

  return (
    <div className={lineClassName} data-testid={`terminal-line-${type}`}>
      {prompt && (
        <span className="terminal-prompt" aria-label="command prompt">
          $
        </span>
      )}
      <span className="terminal-line-content">{content}</span>
    </div>
  );
};

TerminalLine.displayName = 'TerminalLine';