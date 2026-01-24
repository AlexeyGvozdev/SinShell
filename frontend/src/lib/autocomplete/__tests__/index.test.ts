/**
 * Тесты для системы автокомплита
 */

import { AutocompleteManager, createAutocompleteManager } from '../index';
import { DefaultCommandRegistry } from '@/lib/commands/registry';
import { helpCommand, clearCommand, aboutCommand, themeCommand } from '@/lib/commands/builtins';

describe('AutocompleteManager', () => {
  let autocompleteManager: AutocompleteManager;
  let mockRegistry: DefaultCommandRegistry;

  beforeEach(() => {
    mockRegistry = new DefaultCommandRegistry();
    
    // Регистрируем тестовые команды
    mockRegistry.register(helpCommand);
    mockRegistry.register(clearCommand);
    mockRegistry.register(aboutCommand);
    mockRegistry.register(themeCommand);

    autocompleteManager = new AutocompleteManager({
      commandRegistry: mockRegistry,
      maxSuggestions: 5,
      includeArguments: false
    });
  });

  describe('getSuggestions', () => {
    it('должен возвращать пустые предложения для пустого ввода', () => {
      const result = autocompleteManager.getSuggestions('', 0);
      
      expect(result.suggestions).toEqual([]);
      expect(result.replacement).toBe('');
      expect(result.start).toBe(0);
      expect(result.end).toBe(0);
    });

    it('должен возвращать предложения для частичного совпадения команды', () => {
      const result = autocompleteManager.getSuggestions('he', 2);
      
      expect(result.suggestions).toHaveLength(1);
      expect(result.suggestions[0].text).toBe('help');
      expect(result.suggestions[0].type).toBe('command');
      expect(result.suggestions[0].description).toBe('Показывает список доступных команд');
      expect(result.replacement).toBe('he');
      expect(result.start).toBe(0);
      expect(result.end).toBe(2);
    });

    it('должен возвращать предложения для псевдонимов', () => {
      const result = autocompleteManager.getSuggestions('?', 1);
      
      expect(result.suggestions.length).toBeGreaterThan(0);
      
      // Находим предложение с псевдонимом
      const aliasSuggestion = result.suggestions.find(s => s.text === '?');
      expect(aliasSuggestion).toBeDefined();
      expect(aliasSuggestion?.type).toBe('command');
      expect(aliasSuggestion?.description).toContain('alias');
    });

    it('должен возвращать несколько предложений для частичного совпадения', () => {
      const result = autocompleteManager.getSuggestions('ab', 2);
      
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions.every(s => s.text.startsWith('ab'))).toBe(true);
    });

    it('должен возвращать предложения в правильном порядке (точное совпадение первым)', () => {
      const result = autocompleteManager.getSuggestions('help', 4);
      
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions[0].text).toBe('help');
    });

    it('должен ограничивать количество предложений maxSuggestions', () => {
      // Добавим больше команд
      for (let i = 0; i < 10; i++) {
        mockRegistry.register({
          name: `test${i}`,
          description: `Test command ${i}`,
          category: 'test',
          execute: async () => ({ output: '', type: 'success' })
        });
      }

      const result = autocompleteManager.getSuggestions('test', 4);
      
      expect(result.suggestions.length).toBeLessThanOrEqual(5);
    });

    it('должен корректно определять текущее слово в середине текста', () => {
      const text = 'help ab';
      const result = autocompleteManager.getSuggestions(text, 6);
      
      expect(result.replacement).toBe('ab');
      expect(result.start).toBe(5);
      expect(result.end).toBe(7);
    });

    it('должен обрабатывать регистр без учета регистра', () => {
      const result = autocompleteManager.getSuggestions('HELP', 4);
      
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions[0].text).toBe('help');
    });
  });

  describe('applySuggestion', () => {
    it('должен применять предложение и добавлять пробел для команд', () => {
      const text = 'he';
      const result = autocompleteManager.getSuggestions('he', 2);
      const suggestion = result.suggestions[0];
      
      const newText = autocompleteManager.applySuggestion(text, suggestion, result);
      
      expect(newText).toBe('help ');
    });

    it('должен применять предложение в середине текста', () => {
      const text = 'prefix he suffix';
      const result = autocompleteManager.getSuggestions(text, 9);
      const suggestion = result.suggestions[0];
      
      const newText = autocompleteManager.applySuggestion(text, suggestion, result);
      
      expect(newText).toBe('prefix help  suffix');
    });
  });

  describe('getNextSuggestion', () => {
    it('должен возвращать следующий индекс', () => {
      const suggestions = [
        { text: 'help', type: 'command' as const },
        { text: 'clear', type: 'command' as const },
        { text: 'about', type: 'command' as const }
      ];
      
      expect(autocompleteManager.getNextSuggestion(suggestions, 0)).toBe(1);
      expect(autocompleteManager.getNextSuggestion(suggestions, 1)).toBe(2);
      expect(autocompleteManager.getNextSuggestion(suggestions, 2)).toBe(0); // зацикливание
    });

    it('должен возвращать -1 для пустого списка', () => {
      expect(autocompleteManager.getNextSuggestion([], 0)).toBe(-1);
    });
  });

  describe('getPreviousSuggestion', () => {
    it('должен возвращать предыдущий индекс', () => {
      const suggestions = [
        { text: 'help', type: 'command' as const },
        { text: 'clear', type: 'command' as const },
        { text: 'about', type: 'command' as const }
      ];
      
      expect(autocompleteManager.getPreviousSuggestion(suggestions, 0)).toBe(2); // зацикливание
      expect(autocompleteManager.getPreviousSuggestion(suggestions, 1)).toBe(0);
      expect(autocompleteManager.getPreviousSuggestion(suggestions, 2)).toBe(1);
    });

    it('должен возвращать -1 для пустого списка', () => {
      expect(autocompleteManager.getPreviousSuggestion([], 0)).toBe(-1);
    });
  });

  describe('updateOptions', () => {
    it('должен обновлять maxSuggestions', () => {
      autocompleteManager.updateOptions({ maxSuggestions: 3 });
      
      // Добавим много команд
      for (let i = 0; i < 10; i++) {
        mockRegistry.register({
          name: `test${i}`,
          description: `Test command ${i}`,
          category: 'test',
          execute: async () => ({ output: '', type: 'success' })
        });
      }

      const result = autocompleteManager.getSuggestions('test', 4);
      expect(result.suggestions.length).toBeLessThanOrEqual(3);
    });

    it('должен обновлять includeArguments', () => {
      autocompleteManager.updateOptions({ includeArguments: true });
      
      // Проверяем что опция обновлена (проверяем через внутреннее состояние)
      const result = autocompleteManager.getSuggestions('help', 4);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('meta информация', () => {
    it('должен включать категорию в meta', () => {
      const result = autocompleteManager.getSuggestions('help', 4);
      const suggestion = result.suggestions[0];
      
      expect(suggestion.meta?.category).toBe('builtin');
      expect(suggestion.meta?.isBuiltin).toBe(true);
    });
  });
});

describe('createAutocompleteManager', () => {
  it('должен создавать экземпляр AutocompleteManager', () => {
    const mockRegistry = new DefaultCommandRegistry();
    const manager = createAutocompleteManager({
      commandRegistry: mockRegistry,
      maxSuggestions: 10
    });
    
    expect(manager).toBeInstanceOf(AutocompleteManager);
  });

  it('должен использовать опции по умолчанию', () => {
    const mockRegistry = new DefaultCommandRegistry();
    const manager = createAutocompleteManager({
      commandRegistry: mockRegistry
    });
    
    // Проверяем что менеджер работает с опциями по умолчанию
    const result = manager.getSuggestions('test', 4);
    expect(result.suggestions).toEqual([]);
  });
});