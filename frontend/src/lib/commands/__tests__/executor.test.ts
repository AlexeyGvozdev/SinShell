/**
 * Тесты для исполнителя команд
 */

import { CommandExecutor } from '../executor';
import { DefaultCommandRegistry } from '../registry';
import { CommandDefinition } from '@/types';

describe('CommandExecutor', () => {
  let registry: DefaultCommandRegistry;
  let executor: CommandExecutor;

  const mockCommand: CommandDefinition = {
    name: 'test',
    description: 'Test command',
    execute: jest.fn(() => ({
      output: 'test output',
      type: 'success' as const,
      exitCode: 0,
    })),
  };

  const mockErrorCommand: CommandDefinition = {
    name: 'error',
    description: 'Error command',
    execute: jest.fn(() => {
      throw new Error('Test error');
    }),
  };

  beforeEach(() => {
    registry = new DefaultCommandRegistry();
    executor = new CommandExecutor(registry);
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('должен выполнять зарегистрированную команду', async () => {
      registry.register(mockCommand);
      const result = await executor.execute('test');
      
      expect(mockCommand.execute).toHaveBeenCalled();
      expect(result).toEqual({
        output: 'test output',
        type: 'success',
        exitCode: 0,
      });
    });

    it('должен передавать аргументы в команду', async () => {
      registry.register(mockCommand);
      await executor.execute('test arg1 arg2');
      
      expect(mockCommand.execute).toHaveBeenCalledWith({
        args: ['arg1', 'arg2'],
        flags: {},
        rawInput: 'test arg1 arg2',
      });
    });

    it('должен передавать флаги в команду', async () => {
      registry.register(mockCommand);
      await executor.execute('test --flag1 -f');
      
      expect(mockCommand.execute).toHaveBeenCalledWith({
        args: [],
        flags: { flag1: true, f: true },
        rawInput: 'test --flag1 -f',
      });
    });

    it('должен возвращать ошибку для несуществующей команды', async () => {
      const result = await executor.execute('nonexistent');
      
      expect(result.type).toBe('error');
      expect(result.exitCode).toBe(127);
    });

    it('должен возвращать info для пустой команды', async () => {
      const result = await executor.execute('');
      
      expect(result.type).toBe('info');
      expect(result.exitCode).toBe(0);
    });

    it('должен обрабатывать ошибки выполнения команды', async () => {
      registry.register(mockErrorCommand);
      const result = await executor.execute('error');
      
      expect(result.type).toBe('error');
      expect(result.exitCode).toBe(1);
    });

    it('должен поддерживать асинхронные команды', async () => {
      const asyncCommand: CommandDefinition = {
        name: 'async',
        description: 'Async command',
        execute: jest.fn(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return {
            output: 'async output',
            type: 'success' as const,
            exitCode: 0,
          };
        }),
      };

      registry.register(asyncCommand);
      const result = await executor.execute('async');
      
      expect(result).toEqual({
        output: 'async output',
        type: 'success',
        exitCode: 0,
      });
    });
  });

  describe('hasCommand', () => {
    it('должен возвращать true для зарегистрированной команды', () => {
      registry.register(mockCommand);
      expect(executor.hasCommand('test')).toBe(true);
    });

    it('должен возвращать false для несуществующей команды', () => {
      expect(executor.hasCommand('nonexistent')).toBe(false);
    });
  });

  describe('getAvailableCommands', () => {
    it('должен возвращать список доступных команд', () => {
      registry.register(mockCommand);
      registry.register(mockErrorCommand);
      
      const commands = executor.getAvailableCommands();
      expect(commands).toContain('test');
      expect(commands).toContain('error');
      expect(commands).toHaveLength(2);
    });

    it('должен возвращать пустой массив если нет команд', () => {
      const commands = executor.getAvailableCommands();
      expect(commands).toEqual([]);
    });
  });
});