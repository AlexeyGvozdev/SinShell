/**
 * Главный экспорт системы команд
 */

export { commandParser, DefaultCommandParser } from './parser';
export { commandRegistry, DefaultCommandRegistry } from './registry';
export { CommandExecutor } from './executor';
export * from './builtins';

import { commandRegistry } from './registry';
import { helpCommand, clearCommand, aboutCommand, themeCommand } from './builtins';

/**
 * Инициализирует встроенные команды
 */
export function initializeBuiltinCommands(): void {
  commandRegistry.register(helpCommand);
  commandRegistry.register(clearCommand);
  commandRegistry.register(aboutCommand);
  commandRegistry.register(themeCommand);
}

/**
 * Создает экземпляр CommandExecutor с зарегистрированными командами
 */
export function createCommandExecutor() {
  const { CommandExecutor } = require('./executor');
  return new CommandExecutor(commandRegistry);
}