/**
 * Тесты для команды about
 */

import { aboutCommand } from '../about';

describe('aboutCommand', () => {
  it('должна быть зарегистрирована с правильными свойствами', () => {
    expect(aboutCommand.name).toBe('about');
    expect(aboutCommand.description).toBe('Показывает информацию о терминале');
  });

  it('должна возвращать информацию о проекте', () => {
    const result = aboutCommand.execute({
      args: [],
      flags: {},
      rawInput: 'about',
    }) as any;

    expect(result.type).toBe('success');
    expect(result.exitCode).toBe(0);
    expect(result.output).toBeDefined();
  });
});