/**
 * Команда about - показывает информацию о терминале
 */

import React from 'react';
import { CommandDefinition, CommandContext, CommandResult } from '@/types';
import { getConfig } from '@/lib/config';

export const aboutCommand: CommandDefinition = {
  name: 'about',
  description: 'Показывает информацию о терминале',
  usage: 'about',
  
  execute: (context: CommandContext): CommandResult => {
    const config = getConfig();
    const site = config.site;

    const parts = [
      React.createElement('div', { className: 'font-bold text-lg mb-2' }, site.title),
      React.createElement('div', { className: 'mb-2' }, site.description),
      React.createElement('div', null,
        React.createElement('span', { className: 'font-semibold' }, 'Автор: '),
        site.author
      ),
      React.createElement('div', null,
        React.createElement('span', { className: 'font-semibold' }, 'Версия: '),
        site.version
      ),
    ];

    if (site.repository) {
      parts.push(
        React.createElement('div', { className: 'mt-2' },
          React.createElement('span', { className: 'font-semibold' }, 'Репозиторий: '),
          React.createElement('a', {
            href: site.repository,
            target: '_blank',
            rel: 'noopener noreferrer',
            className: 'text-blue-400 hover:underline'
          }, site.repository)
        )
      );
    }

    parts.push(
      React.createElement('div', { className: 'mt-2' }, 
        'Используйте "help" для списка доступных команд'
      )
    );

    return {
      output: React.createElement('div', null, ...parts),
      type: 'success',
      exitCode: 0,
    };
  },
};