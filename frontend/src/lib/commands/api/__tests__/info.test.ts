/**
 * Тесты для API info команд
 */

import { infoCommand, apiInfoCommand, serverStatusCommand, apiRootCommand } from '../info';
import { ApiError as ApiClientError, ApiErrorType } from '@/lib/api/utils';

// Мокаем apiClient
jest.mock('@/lib/api', () => ({
  apiClient: {
    getSystemInfo: jest.fn(),
    getApiInfo: jest.fn(),
    getServerStatus: jest.fn(),
    getApiRoot: jest.fn(),
  },
}));

import { apiClient } from '@/lib/api';

describe('Info API Commands', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('infoCommand', () => {
    it('должен успешно выполнять команду info', async () => {
      const mockInfo = {
        name: 'SinShell',
        version: '1.0.0',
        uptime: 3600,
        environment: 'development',
        nodeVersion: '18.17.0',
      };
      
      (apiClient.getSystemInfo as jest.Mock).mockResolvedValue(mockInfo);

      const result = await infoCommand.execute({
        args: [],
        flags: {},
        rawInput: 'info',
      });

      expect(result.type).toBe('success');
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('📊 Информация о системе:');
      expect(result.output).toContain('🏷️ Название: SinShell');
      expect(result.output).toContain('🔢 Версия: 1.0.0');
      expect(result.output).toContain('⏱️ Время работы: 1ч 0м 0с');
      expect(result.output).toContain('🖥️ Окружение: development');
      expect(apiClient.getSystemInfo).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать ошибки API', async () => {
      const mockError = new ApiClientError('Server unavailable', ApiErrorType.NETWORK_ERROR);
      (apiClient.getSystemInfo as jest.Mock).mockRejectedValue(mockError);

      const result = await infoCommand.execute({
        args: [],
        flags: {},
        rawInput: 'info',
      });

      expect(result.type).toBe('error');
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('❌ Ошибка при получении информации о системе');
      expect(apiClient.getSystemInfo).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать неизвестные ошибки', async () => {
      (apiClient.getSystemInfo as jest.Mock).mockRejectedValue(new Error('Unknown error'));

      const result = await infoCommand.execute({
        args: [],
        flags: {},
        rawInput: 'info',
      });

      expect(result.type).toBe('error');
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('❌ Ошибка при получении информации о системе');
      expect(result.output).toContain('Unknown error');
    });
  });

  describe('apiInfoCommand', () => {
    it('должен успешно выполнять команду api-info', async () => {
      const mockApiInfo = {
        name: 'SinShell API',
        version: '1.0.0',
        description: 'API для терминала SinShell',
        endpoints: ['/api/v1/health', '/api/v1/info', '/api/v1/about'],
        documentation: 'https://docs.sinshell.dev',
      };
      
      (apiClient.getApiInfo as jest.Mock).mockResolvedValue(mockApiInfo);

      const result = await apiInfoCommand.execute({
        args: [],
        flags: {},
        rawInput: 'api-info',
      });

      expect(result.type).toBe('success');
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('🔌 Информация об API:');
      expect(result.output).toContain('📝 Название: SinShell API');
      expect(result.output).toContain('🔢 Версия: 1.0.0');
      expect(result.output).toContain('📄 Описание: API для терминала SinShell');
      expect(apiClient.getApiInfo).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать отсутствующую документацию', async () => {
      const mockApiInfo = {
        name: 'SinShell API',
        version: '1.0.0',
        description: 'API для терминала SinShell',
        endpoints: ['/api/v1/health', '/api/v1/info', '/api/v1/about'],
        documentation: null,
      };
      
      (apiClient.getApiInfo as jest.Mock).mockResolvedValue(mockApiInfo);

      const result = await apiInfoCommand.execute({
        args: [],
        flags: {},
        rawInput: 'api-info',
      });

      expect(result.type).toBe('success');
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('📚 Документация: Недоступна');
      expect(apiClient.getApiInfo).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать ошибки API', async () => {
      const mockError = new ApiClientError('API unavailable', ApiErrorType.SERVER_ERROR);
      (apiClient.getApiInfo as jest.Mock).mockRejectedValue(mockError);

      const result = await apiInfoCommand.execute({
        args: [],
        flags: {},
        rawInput: 'api-info',
      });

      expect(result.type).toBe('error');
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('❌ Ошибка при получении информации об API');
      expect(apiClient.getApiInfo).toHaveBeenCalledTimes(1);
    });
  });

  describe('serverStatusCommand', () => {
    it('должен успешно выполнять команду server-status', async () => {
      const mockStatus = {
        status: 'running' as const,
        uptime: 7200,
        memory: {
          used: 134217728,
          total: 268435456,
          percentage: 50,
        },
        cpu: {
          usage: 25.5,
        },
        environment: 'production',
        timestamp: '2024-01-01T12:00:00Z',
      };
      
      (apiClient.getServerStatus as jest.Mock).mockResolvedValue(mockStatus);

      const result = await serverStatusCommand.execute({
        args: [],
        flags: {},
        rawInput: 'server-status',
      });

      expect(result.type).toBe('success');
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('🖥️ Статус сервера:');
      expect(result.output).toContain('🟢 Статус: running');
      expect(result.output).toContain('⏱️ Время работы: 2ч 0м 0с');
      expect(result.output).toContain('💾 Память:');
      expect(result.output).toContain('Использовано: 128.00 MB');
      expect(result.output).toContain('Всего: 256.00 MB');
      expect(result.output).toContain('Загрузка: 50.0%');
      expect(result.output).toContain('🔥 CPU: 25.5%');
      expect(apiClient.getServerStatus).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать остановленный сервер', async () => {
      const mockStatus = {
        status: 'stopped' as const,
        uptime: 0,
        memory: {
          used: 0,
          total: 268435456,
          percentage: 0,
        },
        cpu: {
          usage: 0,
        },
        environment: 'production',
        timestamp: '2024-01-01T12:00:00Z',
      };
      
      (apiClient.getServerStatus as jest.Mock).mockResolvedValue(mockStatus);

      const result = await serverStatusCommand.execute({
        args: [],
        flags: {},
        rawInput: 'server-status',
      });

      expect(result.type).toBe('error');
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('🔴 Статус: stopped');
      expect(result.output).toContain('⏱️ Время работы: 0ч 0м 0с');
      expect(apiClient.getServerStatus).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать сервер с ошибкой', async () => {
      const mockStatus = {
        status: 'error' as const,
        uptime: 3600,
        memory: {
          used: 134217728,
          total: 268435456,
          percentage: 50,
        },
        cpu: {
          usage: 75.5,
        },
        environment: 'production',
        timestamp: '2024-01-01T12:00:00Z',
      };
      
      (apiClient.getServerStatus as jest.Mock).mockResolvedValue(mockStatus);

      const result = await serverStatusCommand.execute({
        args: [],
        flags: {},
        rawInput: 'server-status',
      });

      expect(result.type).toBe('error');
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('🟡 Статус: error');
      expect(result.output).toContain('🔥 CPU: 75.5%');
      expect(apiClient.getServerStatus).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать неизвестный статус сервера', async () => {
      const mockStatus = {
        status: 'unknown' as const,
        uptime: 1800,
        memory: {
          used: 67108864,
          total: 268435456,
          percentage: 25,
        },
        cpu: {
          usage: 12.5,
        },
        environment: 'development',
        timestamp: '2024-01-01T12:00:00Z',
      };
      
      (apiClient.getServerStatus as jest.Mock).mockResolvedValue(mockStatus);

      const result = await serverStatusCommand.execute({
        args: [],
        flags: {},
        rawInput: 'server-status',
      });

      expect(result.type).toBe('error');
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('⚪ Статус: unknown');
      expect(result.output).toContain('⏱️ Время работы: 0ч 30м 0с');
      expect(apiClient.getServerStatus).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать ошибки API', async () => {
      const mockError = new ApiClientError('Status unavailable', ApiErrorType.TIMEOUT_ERROR);
      (apiClient.getServerStatus as jest.Mock).mockRejectedValue(mockError);

      const result = await serverStatusCommand.execute({
        args: [],
        flags: {},
        rawInput: 'server-status',
      });

      expect(result.type).toBe('error');
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('❌ Ошибка при получении статуса сервера');
      expect(apiClient.getServerStatus).toHaveBeenCalledTimes(1);
    });
  });

  describe('apiRootCommand', () => {
    it('должен успешно выполнять команду api', async () => {
      const mockRoot = {
        version: '1.0.0',
        message: 'Добро пожаловать в SinShell API',
        description: 'RESTful API для терминала',
        endpoints: {
          health: '/api/health',
          info: '/api/info',
          about: '/api/about',
        },
        documentation: 'https://docs.sinshell.dev',
        timestamp: '2024-01-01T12:00:00Z',
      };
      
      (apiClient.getApiRoot as jest.Mock).mockResolvedValue(mockRoot);

      const result = await apiRootCommand.execute({
        args: [],
        flags: {},
        rawInput: 'api',
      });

      expect(result.type).toBe('success');
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('🌐 SinShell API v1.0.0');
      expect(result.output).toContain('Добро пожаловать в SinShell API');
      expect(result.output).toContain('📄 Описание: RESTful API для терминала');
      expect(result.output).toContain('🛣️ Доступные эндпоинты:');
      expect(result.output).toContain('• /api/health - Проверка здоровья');
      expect(result.output).toContain('• /api/info - Информация о системе');
      expect(result.output).toContain('• /api/about - Информация о проекте');
      expect(apiClient.getApiRoot).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать ошибки API', async () => {
      const mockError = new ApiClientError('Root API unavailable', ApiErrorType.NETWORK_ERROR);
      (apiClient.getApiRoot as jest.Mock).mockRejectedValue(mockError);

      const result = await apiRootCommand.execute({
        args: [],
        flags: {},
        rawInput: 'api',
      });

      expect(result.type).toBe('error');
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('❌ Ошибка при получении информации API');
      expect(apiClient.getApiRoot).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать неизвестные ошибки', async () => {
      (apiClient.getApiRoot as jest.Mock).mockRejectedValue(new Error('Unknown root error'));

      const result = await apiRootCommand.execute({
        args: [],
        flags: {},
        rawInput: 'api',
      });

      expect(result.type).toBe('error');
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('❌ Ошибка при получении информации API');
      expect(result.output).toContain('Unknown root error');
    });
  });

  describe('command structure', () => {
    it('должен иметь правильную структуру для infoCommand', () => {
      expect(infoCommand.name).toBe('info');
      expect(infoCommand.description).toBe('Получить информацию о системе');
      expect(infoCommand.usage).toBe('info');
      expect(Array.isArray(infoCommand.examples)).toBe(true);
    });

    it('должен иметь правильную структуру для apiInfoCommand', () => {
      expect(apiInfoCommand.name).toBe('api-info');
      expect(apiInfoCommand.description).toBe('Получить информацию об API');
      expect(apiInfoCommand.usage).toBe('api-info');
      expect(Array.isArray(apiInfoCommand.examples)).toBe(true);
    });

    it('должен иметь правильную структуру для serverStatusCommand', () => {
      expect(serverStatusCommand.name).toBe('server-status');
      expect(serverStatusCommand.description).toBe('Получить детальный статус сервера');
      expect(serverStatusCommand.usage).toBe('server-status');
      expect(Array.isArray(serverStatusCommand.examples)).toBe(true);
    });

    it('должен иметь правильную структуру для apiRootCommand', () => {
      expect(apiRootCommand.name).toBe('api');
      expect(apiRootCommand.description).toBe('Получить корневую информацию API');
      expect(apiRootCommand.usage).toBe('api');
      expect(Array.isArray(apiRootCommand.examples)).toBe(true);
    });
  });
});