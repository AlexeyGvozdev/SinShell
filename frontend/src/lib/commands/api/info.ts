/**
 * API команды для получения информации о системе
 */

import { CommandDefinition, CommandContext, CommandResult } from '@/types/command';
import { apiClient } from '@/lib/api';

/**
 * Команда для получения информации о системе
 */
export const infoCommand: CommandDefinition = {
  name: 'info',
  description: 'Получить информацию о системе',
  usage: 'info',
  examples: ['info'],
  async execute(context: CommandContext): Promise<CommandResult> {
    try {
      const info = await apiClient.getSystemInfo();
      
      const formatUptime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}ч ${minutes}м ${secs}с`;
      };

      return {
        output: `📊 Информация о системе:

🏷️ Название: ${info.name}
🔢 Версия: ${info.version}
⏱️ Время работы: ${formatUptime(info.uptime)}
🖥️ Окружение: ${info.environment}
🟢 Node.js: ${info.nodeVersion}`,
        type: 'success',
        exitCode: 0,
      };
    } catch (error) {
      return {
        output: `❌ Ошибка при получении информации о системе: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        type: 'error',
        exitCode: 1,
      };
    }
  },
};

/**
 * Команда для получения информации об API
 */
export const apiInfoCommand: CommandDefinition = {
  name: 'api-info',
  description: 'Получить информацию об API',
  usage: 'api-info',
  examples: ['api-info'],
  async execute(context: CommandContext): Promise<CommandResult> {
    try {
      const apiInfo = await apiClient.getApiInfo();
      
      const endpointsList = apiInfo.endpoints.map(endpoint => `  • ${endpoint}`).join('\n');

      return {
        output: `🔌 Информация об API:

📝 Название: ${apiInfo.name}
🔢 Версия: ${apiInfo.version}
📄 Описание: ${apiInfo.description}

🛣️ Доступные эндпоинты:
${endpointsList}

📚 Документация: ${apiInfo.documentation || 'Недоступна'}`,
        type: 'success',
        exitCode: 0,
      };
    } catch (error) {
      return {
        output: `❌ Ошибка при получении информации об API: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        type: 'error',
        exitCode: 1,
      };
    }
  },
};

/**
 * Команда для получения статуса сервера
 */
export const serverStatusCommand: CommandDefinition = {
  name: 'server-status',
  description: 'Получить детальный статус сервера',
  usage: 'server-status',
  examples: ['server-status'],
  async execute(context: CommandContext): Promise<CommandResult> {
    try {
      const status = await apiClient.getServerStatus();
      
      const formatUptime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}ч ${minutes}м ${secs}с`;
      };

      const formatMemory = (bytes: number): string => {
        return (bytes / 1024 / 1024).toFixed(2) + ' MB';
      };

      const getStatusIcon = (status: string): string => {
        switch (status) {
          case 'running': return '🟢';
          case 'stopped': return '🔴';
          case 'error': return '🟡';
          default: return '⚪';
        }
      };

      return {
        output: `🖥️ Статус сервера:

${getStatusIcon(status.status)} Статус: ${status.status}
⏱️ Время работы: ${formatUptime(status.uptime)}
🖥️ Окружение: ${status.environment}

💾 Память:
   Использовано: ${formatMemory(status.memory.used)}
   Всего: ${formatMemory(status.memory.total)}
   Загрузка: ${status.memory.percentage.toFixed(1)}%

🔥 CPU: ${status.cpu.usage.toFixed(1)}%

🕐 Обновлено: ${new Date(status.timestamp).toLocaleString('ru-RU')}`,
        type: status.status === 'running' ? 'success' : 'error',
        exitCode: status.status === 'running' ? 0 : 1,
      };
    } catch (error) {
      return {
        output: `❌ Ошибка при получении статуса сервера: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        type: 'error',
        exitCode: 1,
      };
    }
  },
};

/**
 * Команда для получения корневой информации API
 */
export const apiRootCommand: CommandDefinition = {
  name: 'api',
  description: 'Получить корневую информацию API',
  usage: 'api',
  examples: ['api'],
  async execute(context: CommandContext): Promise<CommandResult> {
    try {
      const root = await apiClient.getApiRoot();
      
      return {
        output: `🌐 SinShell API v${root.version}

${root.message}

📄 Описание: ${root.description}

🛣️ Доступные эндпоинты:
  • ${root.endpoints.health} - Проверка здоровья
  • ${root.endpoints.info} - Информация о системе
  • ${root.endpoints.about} - Информация о проекте

📚 Документация: ${root.documentation}

🕐 Время запроса: ${new Date(root.timestamp).toLocaleString('ru-RU')}`,
        type: 'success',
        exitCode: 0,
      };
    } catch (error) {
      return {
        output: `❌ Ошибка при получении информации API: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        type: 'error',
        exitCode: 1,
      };
    }
  },
};