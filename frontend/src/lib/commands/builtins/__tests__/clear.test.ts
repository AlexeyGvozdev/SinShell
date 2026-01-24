/**
 * Тесты для команды clear
 */

import { clearCommand } from '../clear';

describe('clearCommand', () => {
  it('должна быть зарегистрирована с правильными свойствами', () => {
    expect(clearCommand.name).toBe('clear');
    expect(clearCommand.description).toBe('Очищает экран терминала');
    expect(clearCommand.aliases).toEqual(['cls']);
  });

  it('должна возвращать успешный результат', () => {
    const result = clearCommand.execute({
      args: [],
      flags: {},
      rawInput: 'clear',
    }) as any;

    expect(result.type).toBe('success');
    expect(result.exitCode).toBe(0);
    expect(result.output).toBeNull();
  });
});