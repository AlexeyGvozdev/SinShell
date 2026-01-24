/**
 * Главный экспорт системы команд
 */

export { commandParser, DefaultCommandParser } from './parser';
export { commandRegistry, DefaultCommandRegistry } from './registry';
export { CommandExecutor } from './executor';
export * from './builtins';
export * from './api';

import { commandRegistry } from './registry';
import { helpCommand, clearCommand, aboutCommand, themeCommand } from './builtins';
import { apiCommands } from './api';

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
 * Инициализирует API команды
 */
export function initializeApiCommands(): void {
  apiCommands.forEach(command => {
    commandRegistry.register(command);
  });
}

/**
 * Инициализирует все команды (встроенные + API)
 */
export function initializeAllCommands(): void {
  initializeBuiltinCommands();
  initializeApiCommands();
}

/**
 * Создает экземпляр CommandExecutor с зарегистрированными командами
 */
export function createCommandExecutor() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { CommandExecutor } = require('./executor');
  return new CommandExecutor(commandRegistry);
}

/**
 * Создает экземпляр CommandExecutor со всеми командами
 */
export function createFullCommandExecutor() {
  initializeAllCommands();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { CommandExecutor } = require('./executor');
  return new CommandExecutor(commandRegistry);
}