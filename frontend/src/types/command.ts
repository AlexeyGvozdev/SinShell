/**
 * Типы для системы команд
 */

import { ReactNode } from 'react';

/**
 * Контекст выполнения команды
 */
export interface CommandContext {
  /** Аргументы команды */
  args: string[];
  /** Флаги команды (например, --help, -v) */
  flags: Record<string, boolean | string>;
  /** Исходная строка команды */
  rawInput: string;
}

/**
 * Результат выполнения команды
 */
export interface CommandResult {
  /** Вывод команды */
  output: ReactNode;
  /** Тип результата */
  type: 'success' | 'error' | 'info';
  /** Код выхода (0 = успех, >0 = ошибка) */
  exitCode?: number;
}

/**
 * Определение команды
 */
export interface CommandDefinition {
  /** Имя команды */
  name: string;
  /** Краткое описание */
  description: string;
  /** Подробная справка */
  usage?: string;
  /** Примеры использования */
  examples?: string[];
  /** Псевдонимы команды */
  aliases?: string[];
  /** Функция выполнения команды */
  execute: (context: CommandContext) => Promise<CommandResult> | CommandResult;
}

/**
 * Реестр команд
 */
export interface CommandRegistry {
  /** Зарегистрированные команды */
  commands: Map<string, CommandDefinition>;
  /** Регистрация команды */
  register: (command: CommandDefinition) => void;
  /** Отмена регистрации команды */
  unregister: (name: string) => void;
  /** Получение команды по имени или псевдониму */
  get: (name: string) => CommandDefinition | undefined;
  /** Получение всех команд */
  getAll: () => CommandDefinition[];
  /** Проверка существования команды */
  has: (name: string) => boolean;
}

/**
 * Парсер команд
 */
export interface CommandParser {
  /** Парсинг строки команды */
  parse: (input: string) => {
    command: string;
    args: string[];
    flags: Record<string, boolean | string>;
  };
}