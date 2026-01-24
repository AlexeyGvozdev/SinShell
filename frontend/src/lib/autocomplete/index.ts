/**
 * Система автокомплита для терминала
 */

import { 
  AutocompleteOptions, 
  AutocompleteSuggestion, 
  AutocompleteResult,
  CommandRegistry 
} from '@/types';

/**
 * Класс для управления автокомплитом команд
 */
export class AutocompleteManager {
  private commandRegistry: CommandRegistry;
  private maxSuggestions: number;
  private includeArguments: boolean;

  constructor(options: AutocompleteOptions) {
    this.commandRegistry = options.commandRegistry;
    this.maxSuggestions = options.maxSuggestions || 10;
    this.includeArguments = options.includeArguments || false;
  }

  /**
   * Получает предложения автокомплита для указанного текста
   */
  getSuggestions(text: string, cursorPosition: number): AutocompleteResult {
    // Получаем текущее слово и его позицию
    const { currentWord, start, end } = this.getCurrentWord(text, cursorPosition);
    
    if (!currentWord) {
      return {
        suggestions: [],
        replacement: '',
        start: cursorPosition,
        end: cursorPosition
      };
    }

    // Получаем предложения
    const suggestions = this.generateSuggestions(currentWord);
    
    return {
      suggestions,
      replacement: currentWord,
      start,
      end
    };
  }

  /**
   * Получает текущее слово под курсором
   */
  private getCurrentWord(text: string, cursorPosition: number): { currentWord: string; start: number; end: number } {
    // Находим начало текущего слова
    let start = cursorPosition;
    while (start > 0 && text[start - 1] !== ' ' && text[start - 1] !== '\t') {
      start--;
    }

    // Находим конец текущего слова
    let end = cursorPosition;
    while (end < text.length && text[end] !== ' ' && text[end] !== '\t') {
      end++;
    }

    const currentWord = text.substring(start, end);
    return { currentWord, start, end };
  }

  /**
   * Генерирует предложения для указанного слова
   */
  private generateSuggestions(word: string): AutocompleteSuggestion[] {
    const suggestions: AutocompleteSuggestion[] = [];
    const lowerWord = word.toLowerCase();

    // Получаем все команды
    const commands = this.commandRegistry.getAll();

    // Фильтруем и сортируем команды
    const matchingCommands = commands
      .filter(cmd => 
        cmd.name.toLowerCase().startsWith(lowerWord) ||
        cmd.aliases?.some(alias => alias.toLowerCase().startsWith(lowerWord))
      )
      .sort((a, b) => {
        // Приоритет: точное совпадение имени, затем начало имени, затем псевдонимы
        const aNameExact = a.name.toLowerCase() === lowerWord ? 0 : 1;
        const bNameExact = b.name.toLowerCase() === lowerWord ? 0 : 1;
        
        if (aNameExact !== bNameExact) {
          return aNameExact - bNameExact;
        }

        const aNameStart = a.name.toLowerCase().startsWith(lowerWord) ? 0 : 1;
        const bNameStart = b.name.toLowerCase().startsWith(lowerWord) ? 0 : 1;
        
        if (aNameStart !== bNameStart) {
          return aNameStart - bNameStart;
        }

        return a.name.localeCompare(b.name);
      })
      .slice(0, this.maxSuggestions);

    // Создаем предложения для команд
    for (const command of matchingCommands) {
      suggestions.push({
        text: command.name,
        type: 'command',
        description: command.description,
        meta: {
          isBuiltin: command.category === 'builtin',
          category: command.category
        }
      });

      // Добавляем псевдонимы если они есть
      if (command.aliases) {
        for (const alias of command.aliases) {
          if (alias.toLowerCase().startsWith(lowerWord) && alias !== command.name) {
            suggestions.push({
              text: alias,
              type: 'command',
              description: `${command.description} (alias: ${alias})`,
              meta: {
                isBuiltin: command.category === 'builtin',
                category: command.category
              }
            });
          }
        }
      }
    }

    return suggestions;
  }

  /**
   * Применяет выбранное предложение
   */
  applySuggestion(text: string, suggestion: AutocompleteSuggestion, result: AutocompleteResult): string {
    const before = text.substring(0, result.start);
    const after = text.substring(result.end);
    
    // Если это команда, добавляем пробел после нее
    const suffix = suggestion.type === 'command' ? ' ' : '';
    
    return before + suggestion.text + suffix + after;
  }

  /**
   * Получает следующее предложение в списке
   */
  getNextSuggestion(suggestions: AutocompleteSuggestion[], currentIndex: number): number {
    if (suggestions.length === 0) return -1;
    return (currentIndex + 1) % suggestions.length;
  }

  /**
   * Получает предыдущее предложение в списке
   */
  getPreviousSuggestion(suggestions: AutocompleteSuggestion[], currentIndex: number): number {
    if (suggestions.length === 0) return -1;
    return currentIndex <= 0 ? suggestions.length - 1 : currentIndex - 1;
  }

  /**
   * Обновляет опции автокомплита
   */
  updateOptions(options: Partial<AutocompleteOptions>): void {
    if (options.commandRegistry) {
      this.commandRegistry = options.commandRegistry;
    }
    if (options.maxSuggestions !== undefined) {
      this.maxSuggestions = options.maxSuggestions;
    }
    if (options.includeArguments !== undefined) {
      this.includeArguments = options.includeArguments;
    }
  }
}

/**
 * Создает экземпляр менеджера автокомплита
 */
export function createAutocompleteManager(options: AutocompleteOptions): AutocompleteManager {
  return new AutocompleteManager(options);
}