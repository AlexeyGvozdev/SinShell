/**
 * Команда theme - управление темами терминала
 */

import React from 'react';
import { CommandDefinition, CommandContext, CommandResult } from '@/types';
import { getAvailableThemes } from '@/lib/themes';

// Эта команда требует доступа к ThemeContext, который будет передан через контекст
// Пока создадим базовую структуру
export const themeCommand: CommandDefinition = {
  name: 'theme',
  description: 'Управление темами терминала',
  usage: 'theme [название_темы]',
  examples: [
    'theme - показать текущую тему и список доступных',
    'theme dark - переключиться на тему dark',
  ],
  
  execute: (context: CommandContext): CommandResult => {
    const { args } = context;
    const availableThemes = getAvailableThemes();

    // Если нет аргументов - показываем список тем
    if (args.length === 0) {
      const parts = [
        React.createElement('div', { className: 'font-bold mb-2' }, 'Доступные темы:'),
      ];

      availableThemes.forEach((themeName) => {
        parts.push(
          React.createElement('div', { className: 'ml-2' }, `  ${themeName}`)
        );
      });

      parts.push(
        React.createElement('div', { className: 'mt-2' }, 
          'Используйте "theme [название]" для переключения темы'
        )
      );

      return {
        output: React.createElement('div', null, ...parts),
        type: 'info',
        exitCode: 0,
      };
    }

    const themeName = args[0];

    // Проверяем что тема существует
    const themeExists = availableThemes.some(t => t === themeName);
    if (!themeExists) {
      return {
        output: React.createElement('div', null,
          React.createElement('div', null, `Тема "${themeName}" не найдена`),
          React.createElement('div', null, `Доступные темы: ${availableThemes.join(', ')}`)
        ),
        type: 'error',
        exitCode: 1,
      };
    }

    // Тема будет применена через специальный обработчик в Terminal компоненте
    return {
      output: `Тема изменена на: ${themeName}`,
      type: 'success',
      exitCode: 0,
    };
  },
};