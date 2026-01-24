/**
 * Система истории команд терминала
 */

import { CommandHistoryEntry, HistoryState, HistoryActions } from '../../types/history';

export class CommandHistory implements HistoryActions {
  private state: HistoryState;

  constructor(maxSize: number = 100) {
    this.state = {
      entries: [],
      currentIndex: -1,
      maxSize,
    };
  }

  /**
   * Добавить команду в историю
   */
  addCommand(command: string, result?: string): void {
    // Не добавляем пустые команды в историю
    if (!command.trim()) {
      return;
    }

    const entry: CommandHistoryEntry = {
      command: command.trim(),
      timestamp: new Date(),
      result,
    };

    // Добавляем запись в историю
    this.state.entries.push(entry);

    // Ограничиваем размер истории
    if (this.state.entries.length > this.state.maxSize) {
      this.state.entries.shift();
    }

    // Сбрасываем индекс навигации при добавлении новой команды
    this.resetNavigation();
  }

  /**
   * Получить предыдущую команду из истории
   */
  getPreviousCommand(): string | null {
    if (this.state.entries.length === 0) {
      return null;
    }

    // Если мы в начале навигации, устанавливаем индекс на последнюю команду
    if (this.state.currentIndex === -1) {
      this.state.currentIndex = this.state.entries.length - 1;
      return this.state.entries[this.state.currentIndex].command;
    }

    // Если можем перейти к предыдущей команде
    if (this.state.currentIndex > 0) {
      this.state.currentIndex--;
      return this.state.entries[this.state.currentIndex].command;
    }

    // Если мы уже в начале истории, возвращаем текущую команду
    return this.state.entries[this.state.currentIndex].command;
  }

  /**
   * Получить следующую команду из истории
   */
  getNextCommand(): string | null {
    if (this.state.entries.length === 0) {
      return null;
    }

    // Если мы не в режиме навигации, возвращаем null
    if (this.state.currentIndex === -1) {
      return null;
    }

    // Если можем перейти к следующей команде
    if (this.state.currentIndex < this.state.entries.length - 1) {
      this.state.currentIndex++;
      return this.state.entries[this.state.currentIndex].command;
    }

    // Если мы в конце истории, сбрасываем навигацию и возвращаем null
    this.resetNavigation();
    return null;
  }

  /**
   * Сбросить индекс навигации
   */
  resetNavigation(): void {
    this.state.currentIndex = -1;
  }

  /**
   * Очистить историю
   */
  clearHistory(): void {
    this.state.entries = [];
    this.state.currentIndex = -1;
  }

  /**
   * Получить все записи истории
   */
  getHistory(): CommandHistoryEntry[] {
    return [...this.state.entries];
  }

  /**
   * Получить текущее состояние истории
   */
  getState(): HistoryState {
    return {
      ...this.state,
      entries: [...this.state.entries],
    };
  }

  /**
   * Установить максимальный размер истории
   */
  setMaxSize(maxSize: number): void {
    this.state.maxSize = maxSize;
    
    // Обрезаем историю если необходимо
    if (this.state.entries.length > maxSize) {
      const excess = this.state.entries.length - maxSize;
      this.state.entries.splice(0, excess);
      
      // Корректируем текущий индекс если необходимо
      if (this.state.currentIndex >= 0) {
        this.state.currentIndex = Math.max(-1, this.state.currentIndex - excess);
      }
    }
  }

  /**
   * Поиск команд в истории
   */
  searchHistory(query: string): CommandHistoryEntry[] {
    if (!query.trim()) {
      return this.getHistory();
    }

    const lowerQuery = query.toLowerCase();
    return this.state.entries.filter(entry =>
      entry.command.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Получить последние N команд
   */
  getLastCommands(count: number): CommandHistoryEntry[] {
    const start = Math.max(0, this.state.entries.length - count);
    return this.state.entries.slice(start);
  }
}

// Создаем экземпляр истории по умолчанию
export const defaultHistory = new CommandHistory();

// Экспортируем типы
export type { CommandHistoryEntry, HistoryState, HistoryActions };