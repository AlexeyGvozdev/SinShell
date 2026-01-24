/**
 * Команда help - показывает список доступных команд
 */

import React from 'react';
import { CommandDefinition, CommandContext, CommandResult } from '@/types';
import { commandRegistry } from '../registry';

export const helpCommand: CommandDefinition = {
  name: 'help',
  description: 'Показывает список доступных команд',
  usage: 'help [команда]',
  examples: [
    'help - показать все команды',
    'help theme - показать справку по команде theme',
  ],
  aliases: ['?', 'h'],
  
  execute: (context: CommandContext): CommandResult => {
    const { args } = context;

    // Если указана конкретная команда
    if (args.length > 0) {
      const commandName = args[0];
      const command = commandRegistry.get(commandName);

      if (!command) {
        return {
          output: `Команда "${commandName}" не найдена`,
          type: 'error',
          exitCode: 1,
        };
      }

      // Показываем подробную справку по команде
      const parts = [
        React.createElement('div', { className: 'font-bold' }, command.name),
        React.createElement('div', null, command.description),
      ];

      if (command.usage) {
        parts.push(
          React.createElement('div', { className: 'mt-2' }, 
            React.createElement('span', { className: 'font-semibold' }, 'Использование: '),
            command.usage
          )
        );
      }

      if (command.aliases && command.aliases.length > 0) {
        parts.push(
          React.createElement('div', null,
            React.createElement('span', { className: 'font-semibold' }, 'Псевдонимы: '),
            command.aliases.join(', ')
          )
        );
      }

      if (command.examples && command.examples.length > 0) {
        parts.push(
          React.createElement('div', { className: 'mt-2 font-semibold' }, 'Примеры:')
        );
        command.examples.forEach((example) => {
          parts.push(
            React.createElement('div', { className: 'ml-4' }, `  ${example}`)
          );
        });
      }

      return {
        output: React.createElement('div', null, ...parts),
        type: 'success',
        exitCode: 0,
      };
    }

    // Показываем список всех команд
    const commands = commandRegistry.getAll().sort((a, b) => a.name.localeCompare(b.name));

    const parts = [
      React.createElement('div', { className: 'font-bold mb-2' }, 'Доступные команды:'),
    ];

    commands.forEach((cmd) => {
      const aliases = cmd.aliases && cmd.aliases.length > 0 
        ? ` (${cmd.aliases.join(', ')})` 
        : '';
      
      parts.push(
        React.createElement('div', { className: 'ml-2' },
          React.createElement('span', { className: 'font-semibold' }, cmd.name + aliases),
          ' - ',
          cmd.description
        )
      );
    });

    parts.push(
      React.createElement('div', { className: 'mt-2' }, 
        'Используйте "help [команда]" для подробной справки'
      )
    );

    return {
      output: React.createElement('div', null, ...parts),
      type: 'success',
      exitCode: 0,
    };
  },
};