/**
 * API команды для проверки здоровья сервера
 */

import { CommandDefinition, CommandContext, CommandResult } from '@/types/command';
import { apiClient } from '@/lib/api';
import { ApiError as ApiClientError, createLoadingIndicator } from '@/lib/api/utils';

/**
 * Команда для базовой проверки здоровья
 */
export const healthCommand: CommandDefinition = {
  name: 'health',
  description: 'Проверить здоровье сервера',
  usage: 'health',
  examples: ['health'],
  category: 'api',
  async execute(_context: CommandContext): Promise<CommandResult> {
    try {
      const health = await apiClient.getHealth();
      return {
        output: `✅ Сервер работает нормально
Статус: ${health.status}
Время: ${new Date(health.timestamp).toLocaleString('ru-RU')}`,
        type: 'success',
        exitCode: 0,
      };
    } catch (error) {
      if (error instanceof ApiClientError) {
        return {
          output: `${createLoadingIndicator('Проверка здоровья')} ❌ ${error.getUserMessage()}`,
          type: 'error',
          exitCode: 1,
        };
      }
      return {
        output: `❌ Ошибка при проверке здоровья сервера: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        type: 'error',
        exitCode: 1,
      };
    }
  },
};

/**
 * Команда для детальной проверки здоровья
 */
export const healthDetailedCommand: CommandDefinition = {
  name: 'health-detailed',
  description: 'Детальная проверка здоровья сервера',
  usage: 'health-detailed',
  examples: ['health-detailed'],
  category: 'api',
  async execute(_context: CommandContext): Promise<CommandResult> {
    try {
      const health = await apiClient.getDetailedHealth();
      
      const formatUptime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}ч ${minutes}м ${secs}с`;
      };

      const formatMemory = (bytes: number): string => {
        return (bytes / 1024 / 1024).toFixed(2) + ' MB';
      };

      return {
        output: `🏥 Детальная информация о здоровье сервера:

📊 Статус: ${health.status}
⏱️ Время работы: ${formatUptime(health.uptime)}
🖥️ Окружение: ${health.environment}

💾 Память:
   Использовано: ${formatMemory(health.memory.used)}
   Всего: ${formatMemory(health.memory.total)}
   Загрузка: ${health.memory.percentage.toFixed(1)}%

🔥 CPU: ${health.cpu.usage.toFixed(1)}%

🕐 Время проверки: ${new Date(health.timestamp).toLocaleString('ru-RU')}`,
        type: 'success',
        exitCode: 0,
      };
    } catch (error) {
      return {
        output: `❌ Ошибка при получении детальной информации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        type: 'error',
        exitCode: 1,
      };
    }
  },
};

/**
 * Команда для проверки готовности сервера
 */
export const readyCommand: CommandDefinition = {
  name: 'ready',
  description: 'Проверить готовность сервера к работе',
  usage: 'ready',
  examples: ['ready'],
  category: 'api',
  async execute(_context: CommandContext): Promise<CommandResult> {
    try {
      const ready = await apiClient.getReadiness();
      return {
        output: ready.status === 'ok'
          ? '✅ Сервер готов к работе'
          : '❌ Сервер не готов к работе',
        type: ready.status === 'ok' ? 'success' : 'error',
        exitCode: ready.status === 'ok' ? 0 : 1,
      };
    } catch (error) {
      return {
        output: `❌ Ошибка при проверке готовности: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        type: 'error',
        exitCode: 1,
      };
    }
  },
};

/**
 * Команда для проверки жизнеспособности сервера
 */
export const liveCommand: CommandDefinition = {
  name: 'live',
  description: 'Проверить жизнеспособность сервера',
  usage: 'live',
  examples: ['live'],
  category: 'api',
  async execute(_context: CommandContext): Promise<CommandResult> {
    try {
      const live = await apiClient.getLiveness();
      return {
        output: live.status === 'ok'
          ? '✅ Сервер жив и работает'
          : '❌ Сервер не отвечает',
        type: live.status === 'ok' ? 'success' : 'error',
        exitCode: live.status === 'ok' ? 0 : 1,
      };
    } catch (error) {
      return {
        output: `❌ Ошибка при проверке жизнеспособности: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        type: 'error',
        exitCode: 1,
      };
    }
  },
};

/**
 * Команда для проверки доступности API
 */
export const pingCommand: CommandDefinition = {
  name: 'ping',
  description: 'Проверить доступность API и время ответа',
  usage: 'ping',
  examples: ['ping'],
  category: 'api',
  async execute(_context: CommandContext): Promise<CommandResult> {
    try {
      const isAvailable = await apiClient.isAvailable();
      if (!isAvailable) {
        return {
          output: '❌ API недоступен',
          type: 'error',
          exitCode: 1,
        };
      }

      const pingTime = await apiClient.getPingTime();
      return {
        output: `🏓 API доступен
⏱️ Время ответа: ${pingTime.toFixed(2)} мс`,
        type: 'success',
        exitCode: 0,
      };
    } catch (error) {
      return {
        output: `❌ Ошибка при проверке доступности: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        type: 'error',
        exitCode: 1,
      };
    }
  },
};