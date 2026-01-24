/**
 * Компонент для отображения вывода терминала
 */

import React from 'react';
import { HistoryEntry } from '@/types';

export interface TerminalOutputProps {
  entries: HistoryEntry[];
  className?: string;
}

/**
 * Компонент TerminalOutput отображает историю команд и их вывод
 */
export const TerminalOutput: React.FC<TerminalOutputProps> = ({
  entries,
  className = '',
}) => {
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className={`terminal-output ${className}`} role="log" aria-live="polite">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`terminal-line terminal-line--${entry.type}`}
          data-testid={`terminal-entry-${entry.id}`}
        >
          {entry.type === 'command' && (
            <div className="terminal-command" data-testid="terminal-command">
              <span className="terminal-prompt" aria-label="command prompt">
                $
              </span>
              <span className="terminal-command-text">{entry.command}</span>
            </div>
          )}
          {entry.output && (
            <div
              className={`terminal-output-text terminal-output-text--${entry.type}`}
              data-testid="terminal-output-text"
            >
              {entry.output}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

TerminalOutput.displayName = 'TerminalOutput';