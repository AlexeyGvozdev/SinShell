/**
 * Тесты для команды theme
 */

import { themeCommand } from '../theme';
import { CommandResult } from '@/types';

describe('themeCommand', () => {
  it('должна быть зарегистрирована с правильными свойствами', () => {
    expect(themeCommand.name).toBe('theme');
    expect(themeCommand.description).toBe('Управление темами терминала');
  });

  it('должна показывать список доступных тем без аргументов', () => {
    const result = themeCommand.execute({
      args: [],
      flags: {},
      rawInput: 'theme',
    }) as CommandResult;

    expect(result.type).toBe('info');
    expect(result.exitCode).toBe(0);
  });

  it('должна переключать тему при указании существующей темы', () => {
    const result = themeCommand.execute({
      args: ['default'],
      flags: {},
      rawInput: 'theme default',
    }) as CommandResult;

    expect(result.type).toBe('success');
    expect(result.exitCode).toBe(0);
  });

  it('должна возвращать ошибку для несуществующей темы', () => {
    const result = themeCommand.execute({
      args: ['nonexistent'],
      flags: {},
      rawInput: 'theme nonexistent',
    }) as CommandResult;

    expect(result.type).toBe('error');
    expect(result.exitCode).toBe(1);
  });
});