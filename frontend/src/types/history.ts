/**
 * Типы для системы истории команд
 */

export interface CommandHistoryEntry {
  /** Команда */
  command: string;
  /** Временная метка выполнения */
  timestamp: Date;
  /** Результат выполнения команды */
  result?: string;
}

export interface HistoryState {
  /** Массив записей истории */
  entries: CommandHistoryEntry[];
  /** Текущий индекс для навигации по истории */
  currentIndex: number;
  /** Максимальное количество записей в истории */
  maxSize: number;
}

export interface HistoryActions {
  /** Добавить команду в историю */
  addCommand: (command: string, result?: string) => void;
  /** Получить предыдущую команду из истории */
  getPreviousCommand: () => string | null;
  /** Получить следующую команду из истории */
  getNextCommand: () => string | null;
  /** Сбросить индекс навигации */
  resetNavigation: () => void;
  /** Очистить историю */
  clearHistory: () => void;
  /** Получить все записи истории */
  getHistory: () => CommandHistoryEntry[];
}