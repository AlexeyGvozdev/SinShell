/**
 * Тесты для API health команд
 */

import {
  healthCommand,
  healthDetailedCommand,
  readyCommand,
  liveCommand,
  pingCommand
} from '../health';
import { ApiError as ApiClientError, ApiErrorType } from '@/lib/api/utils';

// Мокаем apiClient
jest.mock('@/lib/api', () => ({
  apiClient: {
    getHealth: jest.fn(),
    getDetailedHealth: jest.fn(),
    getReadiness: jest.fn(),
    getLiveness: jest.fn(),
    getPingTime: jest.fn(),
    isAvailable: jest.fn(),
  },
}));

import { apiClient } from '@/lib/api';

describe('Health API Commands', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('healthCommand', () => {
    it('должен успешно выполнять команду health', async () => {
      const mockHealth = {
        status: 'ok',
        timestamp: '2024-01-01T12:00:00Z',
      };
      
      (apiClient.getHealth as jest.Mock).mockResolvedValue(mockHealth);

      const result = await healthCommand.execute({
        args: [],
        flags: {},
        rawInput: 'health',
      });

      expect(result.type).toBe('success');
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('✅ Сервер работает нормально');
      expect(result.output).toContain('Статус: ok');
      expect(apiClient.getHealth).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать ошибки API', async () => {
      const mockError = new ApiClientError('Server unavailable', ApiErrorType.NETWORK_ERROR);
      (apiClient.getHealth as jest.Mock).mockRejectedValue(mockError);

      const result = await healthCommand.execute({
        args: [],
        flags: {},
        rawInput: 'health',
      });

      expect(result.type).toBe('error');
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('❌');
      expect(apiClient.getHealth).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать неизвестные ошибки', async () => {
      (apiClient.getHealth as jest.Mock).mockRejectedValue(new Error('Unknown error'));

      const result = await healthCommand.execute({
        args: [],
        flags: {},
        rawInput: 'health',
      });

      expect(result.type).toBe('error');
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('❌ Ошибка при проверке здоровья сервера');
    });
  });

  describe('pingCommand', () => {
    it('должен успешно выполнять команду ping', async () => {
      (apiClient.isAvailable as jest.Mock).mockResolvedValue(true);
      (apiClient.getPingTime as jest.Mock).mockResolvedValue(150);

      const result = await pingCommand.execute({
        args: [],
        flags: {},
        rawInput: 'ping',
      });

      expect(result.type).toBe('success');
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('🏓 API доступен');
      expect(result.output).toContain('150.00 мс');
      expect(apiClient.isAvailable).toHaveBeenCalledTimes(1);
      expect(apiClient.getPingTime).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать недоступность API', async () => {
      (apiClient.isAvailable as jest.Mock).mockResolvedValue(false);

      const result = await pingCommand.execute({
        args: [],
        flags: {},
        rawInput: 'ping',
      });

      expect(result.type).toBe('error');
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('❌ API недоступен');
      expect(apiClient.isAvailable).toHaveBeenCalledTimes(1);
      expect(apiClient.getPingTime).not.toHaveBeenCalled();
    });

    it('должен обрабатывать ошибки при проверке доступности', async () => {
      (apiClient.isAvailable as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await pingCommand.execute({
        args: [],
        flags: {},
        rawInput: 'ping',
      });

      expect(result.type).toBe('error');
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('❌ Ошибка при проверке доступности');
    });
  });

  describe('healthDetailedCommand', () => {
    it('должен успешно выполнять команду health-detailed', async () => {
      const mockDetailedHealth = {
        status: 'ok',
        uptime: 3661,
        environment: 'development',
        memory: {
          used: 134217728,
          total: 268435456,
          percentage: 50.0,
        },
        cpu: {
          usage: 25.5,
        },
        timestamp: '2024-01-01T12:00:00Z',
      };
      
      (apiClient.getDetailedHealth as jest.Mock).mockResolvedValue(mockDetailedHealth);

      const result = await healthDetailedCommand.execute({
        args: [],
        flags: {},
        rawInput: 'health-detailed',
      });

      expect(result.type).toBe('success');
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('🏥 Детальная информация о здоровье сервера');
      expect(result.output).toContain('Статус: ok');
      expect(result.output).toContain('1ч 1м 1с');
      expect(result.output).toContain('128.00 MB');
      expect(result.output).toContain('256.00 MB');
      expect(result.output).toContain('25.5%');
      expect(apiClient.getDetailedHealth).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать ошибки при получении детальной информации', async () => {
      (apiClient.getDetailedHealth as jest.Mock).mockRejectedValue(new Error('Detailed health error'));

      const result = await healthDetailedCommand.execute({
        args: [],
        flags: {},
        rawInput: 'health-detailed',
      });

      expect(result.type).toBe('error');
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('❌ Ошибка при получении детальной информации');
    });
  });

  describe('readyCommand', () => {
    it('должен успешно выполнять команду ready когда сервер готов', async () => {
      const mockReady = { status: 'ok' };
      (apiClient.getReadiness as jest.Mock).mockResolvedValue(mockReady);

      const result = await readyCommand.execute({
        args: [],
        flags: {},
        rawInput: 'ready',
      });

      expect(result.type).toBe('success');
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('✅ Сервер готов к работе');
      expect(apiClient.getReadiness).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать когда сервер не готов', async () => {
      const mockReady = { status: 'not_ready' };
      (apiClient.getReadiness as jest.Mock).mockResolvedValue(mockReady);

      const result = await readyCommand.execute({
        args: [],
        flags: {},
        rawInput: 'ready',
      });

      expect(result.type).toBe('error');
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('❌ Сервер не готов к работе');
      expect(apiClient.getReadiness).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать ошибки при проверке готовности', async () => {
      (apiClient.getReadiness as jest.Mock).mockRejectedValue(new Error('Readiness error'));

      const result = await readyCommand.execute({
        args: [],
        flags: {},
        rawInput: 'ready',
      });

      expect(result.type).toBe('error');
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('❌ Ошибка при проверке готовности');
    });
  });

  describe('liveCommand', () => {
    it('должен успешно выполнять команду live когда сервер жив', async () => {
      const mockLive = { status: 'ok' };
      (apiClient.getLiveness as jest.Mock).mockResolvedValue(mockLive);

      const result = await liveCommand.execute({
        args: [],
        flags: {},
        rawInput: 'live',
      });

      expect(result.type).toBe('success');
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('✅ Сервер жив и работает');
      expect(apiClient.getLiveness).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать когда сервер не отвечает', async () => {
      const mockLive = { status: 'not_ok' };
      (apiClient.getLiveness as jest.Mock).mockResolvedValue(mockLive);

      const result = await liveCommand.execute({
        args: [],
        flags: {},
        rawInput: 'live',
      });

      expect(result.type).toBe('error');
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('❌ Сервер не отвечает');
      expect(apiClient.getLiveness).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать ошибки при проверке жизнеспособности', async () => {
      (apiClient.getLiveness as jest.Mock).mockRejectedValue(new Error('Liveness error'));

      const result = await liveCommand.execute({
        args: [],
        flags: {},
        rawInput: 'live',
      });

      expect(result.type).toBe('error');
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('❌ Ошибка при проверке жизнеспособности');
    });
  });

  describe('command structure', () => {
    it('должен иметь правильную структуру для healthCommand', () => {
      expect(healthCommand.name).toBe('health');
      expect(healthCommand.description).toBe('Проверить здоровье сервера');
      expect(healthCommand.usage).toBe('health');
      expect(healthCommand.examples).toEqual(['health']);
      expect(typeof healthCommand.execute).toBe('function');
    });

    it('должен иметь правильную структуру для pingCommand', () => {
      expect(pingCommand.name).toBe('ping');
      expect(pingCommand.description).toBe('Проверить доступность API и время ответа');
      expect(pingCommand.usage).toBe('ping');
      expect(pingCommand.examples).toEqual(['ping']);
      expect(typeof pingCommand.execute).toBe('function');
    });

    it('должен иметь правильную структуру для healthDetailedCommand', () => {
      expect(healthDetailedCommand.name).toBe('health-detailed');
      expect(healthDetailedCommand.description).toBe('Детальная проверка здоровья сервера');
      expect(healthDetailedCommand.usage).toBe('health-detailed');
      expect(healthDetailedCommand.examples).toEqual(['health-detailed']);
      expect(typeof healthDetailedCommand.execute).toBe('function');
    });

    it('должен иметь правильную структуру для readyCommand', () => {
      expect(readyCommand.name).toBe('ready');
      expect(readyCommand.description).toBe('Проверить готовность сервера к работе');
      expect(readyCommand.usage).toBe('ready');
      expect(readyCommand.examples).toEqual(['ready']);
      expect(typeof readyCommand.execute).toBe('function');
    });

    it('должен иметь правильную структуру для liveCommand', () => {
      expect(liveCommand.name).toBe('live');
      expect(liveCommand.description).toBe('Проверить жизнеспособность сервера');
      expect(liveCommand.usage).toBe('live');
      expect(liveCommand.examples).toEqual(['live']);
      expect(typeof liveCommand.execute).toBe('function');
    });
  });
});