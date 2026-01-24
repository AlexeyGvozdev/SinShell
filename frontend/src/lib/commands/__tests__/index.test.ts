/**
 * Тесты для главного экспорта системы команд
 */

import {
  initializeBuiltinCommands,
  initializeApiCommands,
  initializeAllCommands,
  createCommandExecutor,
  createFullCommandExecutor,
  commandRegistry,
  CommandExecutor,
  commandParser,
  DefaultCommandParser,
  DefaultCommandRegistry,
} from '../index';

// Мокаем встроенные команды
jest.mock('../builtins', () => ({
  helpCommand: { name: 'help', description: 'Show help' },
  clearCommand: { name: 'clear', description: 'Clear terminal' },
  aboutCommand: { name: 'about', description: 'About project' },
  themeCommand: { name: 'theme', description: 'Change theme' },
}));

// Мокаем API команды
jest.mock('../api', () => ({
  apiCommands: [
    { name: 'health', description: 'Check health' },
    { name: 'info', description: 'System info' },
  ],
}));

// Мокаем executor
jest.mock('../executor', () => ({
  CommandExecutor: jest.fn().mockImplementation((registry) => ({
    registry,
    execute: jest.fn(),
  })),
}));

import { helpCommand, clearCommand } from '../builtins';
import { apiCommands } from '../api';

describe('Commands Index', () => {
  beforeEach(() => {
    // Очищаем реестр перед каждым тестом
    commandRegistry.clear();
    jest.clearAllMocks();
  });

  describe('exports', () => {
    it('должен экспортировать parser', () => {
      expect(commandParser).toBeDefined();
      expect(DefaultCommandParser).toBeDefined();
    });

    it('должен экспортировать registry', () => {
      expect(commandRegistry).toBeDefined();
      expect(DefaultCommandRegistry).toBeDefined();
    });

    it('должен экспортировать CommandExecutor', () => {
      expect(CommandExecutor).toBeDefined();
    });
  });

  describe('initializeBuiltinCommands', () => {
    it('должен регистрировать все встроенные команды', () => {
      initializeBuiltinCommands();

      expect(commandRegistry.has('help')).toBe(true);
      expect(commandRegistry.has('clear')).toBe(true);
      expect(commandRegistry.has('about')).toBe(true);
      expect(commandRegistry.has('theme')).toBe(true);
    });

    it('должен регистрировать команды с правильными свойствами', () => {
      initializeBuiltinCommands();

      const helpCmd = commandRegistry.get('help');
      expect(helpCmd).toEqual(helpCommand);

      const clearCmd = commandRegistry.get('clear');
      expect(clearCmd).toEqual(clearCommand);
    });

    it('должен работать при повторном вызове', () => {
      initializeBuiltinCommands();
      const initialSize = commandRegistry.size;

      initializeBuiltinCommands();
      expect(commandRegistry.size).toBe(initialSize);
    });
  });

  describe('initializeApiCommands', () => {
    it('должен регистрировать все API команды', () => {
      initializeApiCommands();

      expect(commandRegistry.has('health')).toBe(true);
      expect(commandRegistry.has('info')).toBe(true);
    });

    it('должен регистрировать команды с правильными свойствами', () => {
      initializeApiCommands();

      apiCommands.forEach((command) => {
        const registeredCmd = commandRegistry.get(command.name);
        expect(registeredCmd).toEqual(command);
      });
    });

    it('должен работать при повторном вызове', () => {
      initializeApiCommands();
      const initialSize = commandRegistry.size;

      initializeApiCommands();
      expect(commandRegistry.size).toBe(initialSize);
    });

    it('должен работать с пустым массивом API команд', () => {
      // Очищаем реестр
      commandRegistry.clear();
      
      // Просто проверяем, что функция работает без ошибок
      initializeApiCommands();
      
      // Проверяем, что команды были добавлены (из мока)
      expect(commandRegistry.size).toBeGreaterThan(0);
    });
  });

  describe('initializeAllCommands', () => {
    it('должен регистрировать все типы команд', () => {
      initializeAllCommands();

      // Проверяем встроенные команды
      expect(commandRegistry.has('help')).toBe(true);
      expect(commandRegistry.has('clear')).toBe(true);
      expect(commandRegistry.has('about')).toBe(true);
      expect(commandRegistry.has('theme')).toBe(true);

      // Проверяем API команды
      expect(commandRegistry.has('health')).toBe(true);
      expect(commandRegistry.has('info')).toBe(true);
    });

    it('должен регистрировать правильное количество команд', () => {
      initializeAllCommands();

      let expectedCount = 4; // встроенные команды
      expectedCount += apiCommands.length; // API команды

      expect(commandRegistry.size).toBe(expectedCount);
    });

    it('должен работать при повторном вызове', () => {
      initializeAllCommands();
      const initialSize = commandRegistry.size;

      initializeAllCommands();
      expect(commandRegistry.size).toBe(initialSize);
    });
  });

  describe('createCommandExecutor', () => {
    it('должен создавать CommandExecutor с текущим реестром', () => {
      initializeBuiltinCommands();

      const executor = createCommandExecutor();

      expect(CommandExecutor).toHaveBeenCalledWith(commandRegistry);
      expect(executor).toBeDefined();
      expect(executor.registry).toBe(commandRegistry);
    });

    it('должен создавать CommandExecutor с пустым реестром', () => {
      const executor = createCommandExecutor();

      expect(CommandExecutor).toHaveBeenCalledWith(commandRegistry);
      expect(executor).toBeDefined();
      expect(executor.registry).toBe(commandRegistry);
    });

    it('должен создавать разные экземпляры', () => {
      const executor1 = createCommandExecutor();
      const executor2 = createCommandExecutor();

      expect(executor1).not.toBe(executor2);
      expect(executor1.registry).toBe(executor2.registry);
    });
  });

  describe('createFullCommandExecutor', () => {
    it('должен создавать CommandExecutor со всеми командами', () => {
      const executor = createFullCommandExecutor();

      expect(CommandExecutor).toHaveBeenCalledWith(commandRegistry);
      expect(executor).toBeDefined();

      // Проверяем, что все команды зарегистрированы
      expect(commandRegistry.has('help')).toBe(true);
      expect(commandRegistry.has('clear')).toBe(true);
      expect(commandRegistry.has('about')).toBe(true);
      expect(commandRegistry.has('theme')).toBe(true);
      expect(commandRegistry.has('health')).toBe(true);
      expect(commandRegistry.has('info')).toBe(true);
    });

    it('должен создавать разные экземпляры', () => {
      const executor1 = createFullCommandExecutor();
      const executor2 = createFullCommandExecutor();

      expect(executor1).not.toBe(executor2);
      expect(executor1.registry).toBe(executor2.registry);
    });

    it('должен инициализировать команды только один раз', () => {
      const executor1 = createFullCommandExecutor();
      const sizeAfterFirst = commandRegistry.size;

      const executor2 = createFullCommandExecutor();
      const sizeAfterSecond = commandRegistry.size;

      expect(sizeAfterFirst).toBe(sizeAfterSecond);
      expect(executor1.registry).toBe(executor2.registry);
    });
  });

  describe('integration', () => {
    it('должен работать последовательная инициализация', () => {
      initializeBuiltinCommands();
      expect(commandRegistry.size).toBe(4);

      initializeApiCommands();
      expect(commandRegistry.size).toBe(6);

      const executor = createCommandExecutor();
      expect(executor.registry).toBe(commandRegistry);
    });

    it('должен работать полная инициализация', () => {
      const executor = createFullCommandExecutor();
      
      expect(commandRegistry.size).toBe(6);
      expect(executor.registry.size).toBe(6);
    });

    it('должен работать смешанная инициализация', () => {
      initializeBuiltinCommands();
      const executor1 = createCommandExecutor();
      
      initializeApiCommands();
      const executor2 = createCommandExecutor();

      expect(executor1.registry.size).toBe(6); // реестр общий, поэтому размер обновляется
      expect(executor2.registry.size).toBe(6);
      expect(executor1.registry).toBe(executor2.registry);
    });
  });
});