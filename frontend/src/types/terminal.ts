/**
 * Типы для терминала
 */

export interface HistoryEntry {
  id: string;
  command: string;
  output: React.ReactNode;
  timestamp: Date;
  type: 'command' | 'output' | 'error' | 'success';
}

export interface TerminalState {
  history: HistoryEntry[];
  currentInput: string;
  isProcessing: boolean;
}

export interface TerminalContextType {
  history: HistoryEntry[];
  currentInput: string;
  isProcessing: boolean;
  addToHistory: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void;
  setCurrentInput: (input: string) => void;
  clearHistory: () => void;
  executeCommand: (command: string) => Promise<void>;
}