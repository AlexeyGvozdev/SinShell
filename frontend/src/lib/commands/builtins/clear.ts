/**
 * Команда clear - очищает терминал
 */

import { CommandDefinition, CommandContext, CommandResult } from '@/types';

export const clearCommand: CommandDefinition = {
  name: 'clear',
  description: 'Очищает экран терминала',
  usage: 'clear',
  aliases: ['cls'],
  category: 'builtin',
  
  execute: (__context: CommandContext): CommandResult => {
    // Команда clear обрабатывается специальным образом в Terminal компоненте
    // Здесь мы просто возвращаем специальный маркер
    return {
      output: null,
      type: 'success',
      exitCode: 0,
    };
  },
};