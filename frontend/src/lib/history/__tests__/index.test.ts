/**
 * Тесты для системы истории команд
 */

import { CommandHistory } from '../index';
import { CommandHistoryEntry } from '../../../types/history';

describe('CommandHistory', () => {
  let history: CommandHistory;

  beforeEach(() => {
    history = new CommandHistory(5); // Ограничим историю для тестов
  });

  describe('addCommand', () => {
    it('должен добавлять команду в историю', () => {
      history.addCommand('help');
      const entries = history.getHistory();
      
      expect(entries).toHaveLength(1);
      expect(entries[0].command).toBe('help');
      expect(entries[0].timestamp).toBeInstanceOf(Date);
    });

    it('не должен добавлять пустые команды', () => {
      history.addCommand('');
      history.addCommand('   ');
      
      const entries = history.getHistory();
      expect(entries).toHaveLength(0);
    });

    it('должен обрезать пробелы в команде', () => {
      history.addCommand('  help  ');
      const entries = history.getHistory();
      
      expect(entries[0].command).toBe('help');
    });

    it('должен добавлять результат выполнения', () => {
      const result = 'Command executed successfully';
      history.addCommand('help', result);
      
      const entries = history.getHistory();
      expect(entries[0].result).toBe(result);
    });

    it('должен сбрасывать навигацию при добавлении команды', () => {
      history.addCommand('cmd1');
      history.addCommand('cmd2');
      
      // Начинаем навигацию
      history.getPreviousCommand();
      expect(history.getPreviousCommand()).toBe('cmd1');
      
      // Добавляем новую команду
      history.addCommand('cmd3');
      
      // Навигация должна сброситься
      expect(history.getPreviousCommand()).toBe('cmd3');
    });

    it('должен ограничивать размер истории', () => {
      // Добавляем 7 команд (максимум 5)
      for (let i = 1; i <= 7; i++) {
        history.addCommand(`cmd${i}`);
      }
      
      const entries = history.getHistory();
      expect(entries).toHaveLength(5);
      expect(entries[0].command).toBe('cmd3'); // Первые 2 должны быть удалены
      expect(entries[4].command).toBe('cmd7');
    });
  });

  describe('getPreviousCommand', () => {
    beforeEach(() => {
      history.addCommand('cmd1');
      history.addCommand('cmd2');
      history.addCommand('cmd3');
    });

    it('должен возвращать последнюю команду при первом вызове', () => {
      const command = history.getPreviousCommand();
      expect(command).toBe('cmd3');
    });

    it('должен возвращать предыдущую команду при последующих вызовах', () => {
      history.getPreviousCommand(); // cmd3
      expect(history.getPreviousCommand()).toBe('cmd2');
      expect(history.getPreviousCommand()).toBe('cmd1');
    });

    it('должен возвращать первую команду при достижении начала истории', () => {
      history.getPreviousCommand(); // cmd3
      history.getPreviousCommand(); // cmd2
      history.getPreviousCommand(); // cmd1
      
      expect(history.getPreviousCommand()).toBe('cmd1');
    });

    it('должен возвращать null для пустой истории', () => {
      const emptyHistory = new CommandHistory();
      expect(emptyHistory.getPreviousCommand()).toBeNull();
    });
  });

  describe('getNextCommand', () => {
    beforeEach(() => {
      history.addCommand('cmd1');
      history.addCommand('cmd2');
      history.addCommand('cmd3');
    });

    it('должен возвращать null если не в режиме навигации', () => {
      expect(history.getNextCommand()).toBeNull();
    });

    it('должен возвращать следующую команду', () => {
      history.getPreviousCommand(); // cmd3
      history.getPreviousCommand(); // cmd2
      
      expect(history.getNextCommand()).toBe('cmd3');
    });

    it('должен возвращать null и сбрасывать навигацию в конце истории', () => {
      history.getPreviousCommand(); // cmd3
      history.getPreviousCommand(); // cmd2
      history.getPreviousCommand(); // cmd1
      
      expect(history.getNextCommand()).toBe('cmd2');
      expect(history.getNextCommand()).toBe('cmd3');
      expect(history.getNextCommand()).toBeNull();
      
      // После этого навигация должна быть сброшена
      expect(history.getPreviousCommand()).toBe('cmd3');
    });

    it('должен возвращать null для пустой истории', () => {
      const emptyHistory = new CommandHistory();
      expect(emptyHistory.getNextCommand()).toBeNull();
    });
  });

  describe('resetNavigation', () => {
    it('должен сбрасывать индекс навигации', () => {
      history.addCommand('cmd1');
      history.getPreviousCommand();
      
      history.resetNavigation();
      
      expect(history.getPreviousCommand()).toBe('cmd1');
    });
  });

  describe('clearHistory', () => {
    it('должен очищать всю историю', () => {
      history.addCommand('cmd1');
      history.addCommand('cmd2');
      
      history.clearHistory();
      
      expect(history.getHistory()).toHaveLength(0);
      expect(history.getPreviousCommand()).toBeNull();
      expect(history.getNextCommand()).toBeNull();
    });
  });

  describe('getState', () => {
    it('должен возвращать текущее состояние', () => {
      history.addCommand('cmd1');
      history.getPreviousCommand();
      
      const state = history.getState();
      
      expect(state.entries).toHaveLength(1);
      expect(state.currentIndex).toBe(0);
      expect(state.maxSize).toBe(5);
    });

    it('должен возвращать копию состояния', () => {
      history.addCommand('cmd1');
      const state = history.getState();
      
      // Модифицируем возвращенное состояние
      state.entries.push({ command: 'cmd2', timestamp: new Date() } as CommandHistoryEntry);
      
      // Оригинальное состояние не должно измениться
      expect(history.getHistory()).toHaveLength(1);
    });
  });

  describe('setMaxSize', () => {
    it('должен устанавливать новый максимальный размер', () => {
      history.setMaxSize(10);
      expect(history.getState().maxSize).toBe(10);
    });

    it('должен обрезать историю при уменьшении размера', () => {
      // Добавляем 5 команд
      for (let i = 1; i <= 5; i++) {
        history.addCommand(`cmd${i}`);
      }
      
      // Уменьшаем размер до 3
      history.setMaxSize(3);
      
      const entries = history.getHistory();
      expect(entries).toHaveLength(3);
      expect(entries[0].command).toBe('cmd3');
      expect(entries[2].command).toBe('cmd5');
    });

    it('должен корректировать индекс навигации при обрезке', () => {
      // Добавляем 5 команд
      for (let i = 1; i <= 5; i++) {
        history.addCommand(`cmd${i}`);
      }
      
      // Начинаем навигацию с конца
      history.getPreviousCommand(); // cmd5
      
      // Уменьшаем размер до 3
      history.setMaxSize(3);
      
      // Индекс должен быть скорректирован
      expect(history.getState().currentIndex).toBe(2);
    });
  });

  describe('searchHistory', () => {
    beforeEach(() => {
      history.addCommand('help');
      history.addCommand('clear');
      history.addCommand('theme dark');
      history.addCommand('theme light');
      history.addCommand('about');
    });

    it('должен находить команды по запросу', () => {
      const results = history.searchHistory('theme');
      expect(results).toHaveLength(2);
      expect(results[0].command).toBe('theme dark');
      expect(results[1].command).toBe('theme light');
    });

    it('должен быть нечувствительным к регистру', () => {
      const results = history.searchHistory('THEME');
      expect(results).toHaveLength(2);
    });

    it('должен возвращать всю историю для пустого запроса', () => {
      const results = history.searchHistory('');
      expect(results).toHaveLength(5);
    });

    it('должен возвращать пустой массив для отсутствующих результатов', () => {
      const results = history.searchHistory('nonexistent');
      expect(results).toHaveLength(0);
    });
  });

  describe('getLastCommands', () => {
    beforeEach(() => {
      for (let i = 1; i <= 5; i++) {
        history.addCommand(`cmd${i}`);
      }
    });

    it('должен возвращать последние N команд', () => {
      const last3 = history.getLastCommands(3);
      expect(last3).toHaveLength(3);
      expect(last3[0].command).toBe('cmd3');
      expect(last3[2].command).toBe('cmd5');
    });

    it('должен возвращать все команды если запрошено больше чем есть', () => {
      const last10 = history.getLastCommands(10);
      expect(last10).toHaveLength(5);
      expect(last10[0].command).toBe('cmd1');
      expect(last10[4].command).toBe('cmd5');
    });

    it('должен возвращать пустой массив для нулевого count', () => {
      const last0 = history.getLastCommands(0);
      expect(last0).toHaveLength(0);
    });
  });

  describe('интеграционные тесты', () => {
    it('должен корректно работать с полной сессией использования', () => {
      // Пользователь вводит несколько команд
      history.addCommand('help');
      history.addCommand('theme dark');
      history.addCommand('clear');
      
      // Навигация по истории вверх
      expect(history.getPreviousCommand()).toBe('clear');
      expect(history.getPreviousCommand()).toBe('theme dark');
      expect(history.getPreviousCommand()).toBe('help');
      
      // Навигация по истории вниз
      expect(history.getNextCommand()).toBe('theme dark');
      expect(history.getNextCommand()).toBe('clear');
      expect(history.getNextCommand()).toBeNull();
      
      // Новая команда сбрасывает навигацию
      history.addCommand('about');
      expect(history.getPreviousCommand()).toBe('about');
      
      // Проверка поиска
      const themeCommands = history.searchHistory('theme');
      expect(themeCommands).toHaveLength(1);
      expect(themeCommands[0].command).toBe('theme dark');
      
      // Проверка последних команд
      const last2 = history.getLastCommands(2);
      expect(last2[0].command).toBe('clear');
      expect(last2[1].command).toBe('about');
    });
  });
});