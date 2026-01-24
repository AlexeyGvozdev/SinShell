/**
 * Тесты для реестра команд
 */

import { DefaultCommandRegistry } from '../registry';
import { CommandDefinition } from '@/types';

describe('DefaultCommandRegistry', () => {
  let registry: DefaultCommandRegistry;

  const mockCommand: CommandDefinition = {
    name: 'test',
    description: 'Test command',
    execute: () => ({ output: 'test', type: 'success', exitCode: 0 }),
  };

  const mockCommandWithAliases: CommandDefinition = {
    name: 'list',
    description: 'List command',
    aliases: ['ls', 'l'],
    execute: () => ({ output: 'list', type: 'success', exitCode: 0 }),
  };

  beforeEach(() => {
    registry = new DefaultCommandRegistry();
  });

  describe('register', () => {
    it('должен регистрировать команду', () => {
      registry.register(mockCommand);
      expect(registry.has('test')).toBe(true);
    });

    it('должен регистрировать команду с псевдонимами', () => {
      registry.register(mockCommandWithAliases);
      expect(registry.has('list')).toBe(true);
      expect(registry.has('ls')).toBe(true);
      expect(registry.has('l')).toBe(true);
    });
  });

  describe('unregister', () => {
    it('должен отменять регистрацию команды', () => {
      registry.register(mockCommand);
      registry.unregister('test');
      expect(registry.has('test')).toBe(false);
    });

    it('должен удалять псевдонимы при отмене регистрации', () => {
      registry.register(mockCommandWithAliases);
      registry.unregister('list');
      expect(registry.has('list')).toBe(false);
      expect(registry.has('ls')).toBe(false);
      expect(registry.has('l')).toBe(false);
    });
  });

  describe('get', () => {
    it('должен возвращать команду по имени', () => {
      registry.register(mockCommand);
      const command = registry.get('test');
      expect(command).toBe(mockCommand);
    });

    it('должен возвращать команду по псевдониму', () => {
      registry.register(mockCommandWithAliases);
      const command1 = registry.get('ls');
      const command2 = registry.get('l');
      expect(command1).toBe(mockCommandWithAliases);
      expect(command2).toBe(mockCommandWithAliases);
    });

    it('должен возвращать undefined для несуществующей команды', () => {
      const command = registry.get('nonexistent');
      expect(command).toBeUndefined();
    });
  });

  describe('getAll', () => {
    it('должен возвращать все зарегистрированные команды', () => {
      registry.register(mockCommand);
      registry.register(mockCommandWithAliases);
      const commands = registry.getAll();
      expect(commands).toHaveLength(2);
      expect(commands).toContain(mockCommand);
      expect(commands).toContain(mockCommandWithAliases);
    });

    it('должен возвращать пустой массив если нет команд', () => {
      const commands = registry.getAll();
      expect(commands).toEqual([]);
    });
  });

  describe('has', () => {
    it('должен возвращать true для зарегистрированной команды', () => {
      registry.register(mockCommand);
      expect(registry.has('test')).toBe(true);
    });

    it('должен возвращать true для псевдонима', () => {
      registry.register(mockCommandWithAliases);
      expect(registry.has('ls')).toBe(true);
    });

    it('должен возвращать false для несуществующей команды', () => {
      expect(registry.has('nonexistent')).toBe(false);
    });
  });

  describe('clear', () => {
    it('должен очищать все команды', () => {
      registry.register(mockCommand);
      registry.register(mockCommandWithAliases);
      registry.clear();
      expect(registry.size).toBe(0);
      expect(registry.has('test')).toBe(false);
      expect(registry.has('list')).toBe(false);
    });
  });

  describe('size', () => {
    it('должен возвращать количество команд', () => {
      expect(registry.size).toBe(0);
      registry.register(mockCommand);
      expect(registry.size).toBe(1);
      registry.register(mockCommandWithAliases);
      expect(registry.size).toBe(2);
    });
  });
});