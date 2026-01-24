/**
 * Исполнитель команд терминала
 */

import React from 'react';
import { CommandContext, CommandResult, CommandRegistry } from '@/types';
import { commandParser } from './parser';

/**
 * Класс для выполнения команд
 */
export class CommandExecutor {
  constructor(private registry: CommandRegistry) {}

  /**
   * Выполняет команду из строки ввода
   */
  async execute(input: string): Promise<CommandResult> {
    try {
      // Парсим команду
      const { command: commandName, args, flags } = commandParser.parse(input);

      // Проверяем что команда не пустая
      if (!commandName) {
        return {
          output: 'Введите команду. Используйте "help" для списка доступных команд.',
          type: 'info',
          exitCode: 0,
        };
      }

      // Ищем команду в реестре
      const command = this.registry.get(commandName);

      if (!command) {
        return {
          output: React.createElement(
            'div',
            null,
            React.createElement('div', null, `Команда не найдена: ${commandName}`),
            React.createElement('div', null, 'Используйте "help" для списка доступных команд.')
          ),
          type: 'error',
          exitCode: 127, // Command not found
        };
      }

      // Создаем контекст выполнения
      const context: CommandContext = {
        args,
        flags,
        rawInput: input,
      };

      // Выполняем команду
      const result = await Promise.resolve(command.execute(context));

      return result;
    } catch (error) {
      // Обрабатываем ошибки выполнения
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      
      return {
        output: React.createElement(
          'div',
          null,
          React.createElement('div', null, 'Ошибка выполнения команды:'),
          React.createElement('div', null, errorMessage)
        ),
        type: 'error',
        exitCode: 1,
      };
    }
  }

  /**
   * Проверяет существование команды
   */
  hasCommand(name: string): boolean {
    return this.registry.has(name);
  }

  /**
   * Получает список всех доступных команд
   */
  getAvailableCommands(): string[] {
    return this.registry.getAll().map((cmd) => cmd.name);
  }
}