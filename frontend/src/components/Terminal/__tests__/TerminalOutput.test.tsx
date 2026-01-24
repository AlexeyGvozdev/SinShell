/**
 * Тесты для компонента TerminalOutput
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TerminalOutput } from '../TerminalOutput';
import { HistoryEntry } from '@/types';

describe('TerminalOutput', () => {
  const mockEntries: HistoryEntry[] = [
    {
      id: '1',
      command: 'ls',
      output: null,
      timestamp: new Date(),
      type: 'command',
    },
    {
      id: '2',
      command: '',
      output: 'file1.txt file2.txt',
      timestamp: new Date(),
      type: 'output',
    },
    {
      id: '3',
      command: 'error-command',
      output: null,
      timestamp: new Date(),
      type: 'command',
    },
    {
      id: '4',
      command: '',
      output: 'Error: Command not found',
      timestamp: new Date(),
      type: 'error',
    },
  ];

  it('должен рендериться без ошибок', () => {
    render(<TerminalOutput entries={[]} />);
  });

  it('не должен отображать ничего если нет записей', () => {
    const { container } = render(<TerminalOutput entries={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('должен отображать все записи из истории', () => {
    render(<TerminalOutput entries={mockEntries} />);
    
    mockEntries.forEach((entry) => {
      const element = screen.getByTestId(`terminal-entry-${entry.id}`);
      expect(element).toBeInTheDocument();
    });
  });

  it('должен отображать команды с промптом', () => {
    render(<TerminalOutput entries={mockEntries} />);
    
    const commandElements = screen.getAllByTestId('terminal-command');
    expect(commandElements).toHaveLength(2); // 2 команды в mockEntries
    
    // Проверяем что команды отображаются
    expect(screen.getByText('ls')).toBeInTheDocument();
    expect(screen.getByText('error-command')).toBeInTheDocument();
  });

  it('должен отображать вывод команд', () => {
    render(<TerminalOutput entries={mockEntries} />);
    
    const outputElements = screen.getAllByTestId('terminal-output-text');
    expect(outputElements).toHaveLength(2); // 2 вывода в mockEntries
    
    // Проверяем что вывод отображается
    expect(screen.getByText('file1.txt file2.txt')).toBeInTheDocument();
    expect(screen.getByText('Error: Command not found')).toBeInTheDocument();
  });

  it('должен применять правильные CSS классы для разных типов', () => {
    render(<TerminalOutput entries={mockEntries} />);
    
    const commandEntry = screen.getByTestId('terminal-entry-1');
    expect(commandEntry).toHaveClass('terminal-entry--command');
    
    const outputEntry = screen.getByTestId('terminal-entry-2');
    expect(outputEntry).toHaveClass('terminal-entry--output');
    
    const errorEntry = screen.getByTestId('terminal-entry-4');
    expect(errorEntry).toHaveClass('terminal-entry--error');
  });

  it('должен применять кастомный className', () => {
    const { container } = render(
      <TerminalOutput entries={mockEntries} className="custom-class" />
    );
    
    const output = container.querySelector('.terminal-output');
    expect(output).toHaveClass('custom-class');
  });

  it('должен иметь правильные ARIA атрибуты', () => {
    render(<TerminalOutput entries={mockEntries} />);
    
    const output = screen.getByRole('log');
    expect(output).toHaveAttribute('aria-live', 'polite');
  });

  it('должен отображать React элементы в output', () => {
    const entriesWithReactOutput: HistoryEntry[] = [
      {
        id: '1',
        command: 'test',
        output: <div data-testid="react-output">React Output</div>,
        timestamp: new Date(),
        type: 'output',
      },
    ];
    
    render(<TerminalOutput entries={entriesWithReactOutput} />);
    
    expect(screen.getByTestId('react-output')).toBeInTheDocument();
    expect(screen.getByText('React Output')).toBeInTheDocument();
  });
});