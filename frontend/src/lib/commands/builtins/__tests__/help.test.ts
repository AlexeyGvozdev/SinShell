/**
 * Тесты для команды help
 */

import { helpCommand } from '../help';
import { commandRegistry } from '../../registry';
import { CommandDefinition, CommandResult } from '@/types';

describe('helpCommand', () => {
  const mockCommand: CommandDefinition = {
    name: 'test',
    description: 'Test command',
    usage: 'test [args]',
    examples: ['test example1', 'test example2'],
    aliases: ['t'],
    execute: () => ({ output: 'test', type: 'success', exitCode: 0 }),
  };

  beforeEach(() => {
    commandRegistry.clear();
    commandRegistry.register(helpCommand);
  });

  afterEach(() => {
    commandRegistry.clear();
  });

  it('должна быть зарегистрирована с правильными свойствами', () => {
    expect(helpCommand.name).toBe('help');
    expect(helpCommand.description).toBe('Показывает список доступных команд');
    expect(helpCommand.aliases).toEqual(['?', 'h']);
  });

  it('должна показывать список всех команд', () => {
    commandRegistry.register(mockCommand);
    
    const result = helpCommand.execute({
      args: [],
      flags: {},
      rawInput: 'help',
    }) as CommandResult;

    expect(result.type).toBe('success');
    expect(result.exitCode).toBe(0);
  });

  it('должна показывать справку по конкретной команде', () => {
    commandRegistry.register(mockCommand);
    
    const result = helpCommand.execute({
      args: ['test'],
      flags: {},
      rawInput: 'help test',
    }) as CommandResult;

    expect(result.type).toBe('success');
    expect(result.exitCode).toBe(0);
  });

  it('должна возвращать ошибку для несуществующей команды', () => {
    const result = helpCommand.execute({
      args: ['nonexistent'],
      flags: {},
      rawInput: 'help nonexistent',
    }) as CommandResult;

    expect(result.type).toBe('error');
    expect(result.exitCode).toBe(1);
  });
});