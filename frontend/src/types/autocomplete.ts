/**
 * Типы для системы автокомплита терминала
 */

import { CommandRegistry } from '@/types';

/**
 * Опции для автокомплита
 */
export interface AutocompleteOptions {
  /** Регистр команд для получения доступных команд */
  commandRegistry: CommandRegistry;
  /** Максимальное количество предложений */
  maxSuggestions?: number;
  /** Включать ли аргументы команд в предложения */
  includeArguments?: boolean;
}

/**
 * Предложение автокомплита
 */
export interface AutocompleteSuggestion {
  /** Текст предложения */
  text: string;
  /** Тип предложения */
  type: 'command' | 'argument' | 'flag';
  /** Описание команды (только для типа command) */
  description?: string;
  /** Дополнительная информация */
  meta?: {
    /** Является ли команда встроенной */
    isBuiltin?: boolean;
    /** Категория команды */
    category?: string;
  };
}

/**
 * Результат автокомплита
 */
export interface AutocompleteResult {
  /** Список предложений */
  suggestions: AutocompleteSuggestion[];
  /** Заменяемый текст */
  replacement: string;
  /** Начальная позиция для замены */
  start: number;
  /** Конечная позиция для замены */
  end: number;
}

/**
 * Состояние автокомплита
 */
export interface AutocompleteState {
  /** Текущие предложения */
  suggestions: AutocompleteSuggestion[];
  /** Выбранный индекс предложения */
  selectedIndex: number;
  /** Видим ли автокомплит */
  isVisible: boolean;
  /** Позиция курсора для автокомплита */
  cursorPosition: number;
}

/**
 * Действия для автокомплита
 */
export interface AutocompleteActions {
  /** Показать предложения */
  showSuggestions: (suggestions: AutocompleteSuggestion[], cursorPosition: number) => void;
  /** Скрыть предложения */
  hideSuggestions: () => void;
  /** Выбрать следующее предложение */
  selectNext: () => void;
  /** Выбрать предыдущее предложение */
  selectPrevious: () => void;
  /** Применить выбранное предложение */
  applySuggestion: () => string | null;
  /** Получить предложения для текста */
  getSuggestions: (text: string, cursorPosition: number) => AutocompleteResult;
}

/**
 * Полный контекст автокомплита
 */
export interface AutocompleteContext extends AutocompleteState, AutocompleteActions {}

/**
 * Конфигурация компонента автокомплита
 */
export interface AutocompleteProps {
  /** Текущее значение input */
  value: string;
  /** Позиция курсора */
  cursorPosition: number;
  /** Callback при выборе предложения */
  onSelect: (suggestion: AutocompleteSuggestion, replacement: string) => void;
  /** Callback при скрытии автокомплита */
  onHide?: () => void;
  /** Кастомные стили */
  className?: string;
  /** Максимальная высота списка предложений */
  maxHeight?: number;
}