/**
 * Тесты для API about команд
 */

import {
  aboutApiCommand,
  aboutExtendedCommand,
  projectCommand,
  licenseCommand
} from '../about';
import { ApiError as ApiClientError, ApiErrorType } from '@/lib/api/utils';

// Мокаем apiClient
jest.mock('@/lib/api', () => ({
  apiClient: {
    getAbout: jest.fn(),
    getExtendedAbout: jest.fn(),
    getLicense: jest.fn(),
    getHealth: jest.fn(),
  },
}));

import { apiClient } from '@/lib/api';

describe('About API Commands', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('aboutApiCommand', () => {
    it('должен успешно выполнять команду about-api', async () => {
      const mockAbout = {
        title: 'SinShell',
        description: 'Терминал-стильный веб-сайт',
        author: 'SinShell Team',
        version: '1.0.0',
        links: [
          { name: 'GitHub', url: 'https://github.com/sinshell/sinshell', icon: '🐙' },
          { name: 'Documentation', url: 'https://docs.sinshell.dev', icon: '📚' },
        ],
        technologies: ['Next.js', 'TypeScript', 'Tailwind CSS'],
      };
      
      (apiClient.getAbout as jest.Mock).mockResolvedValue(mockAbout);

      const result = await aboutApiCommand.execute({
        args: [],
        flags: {},
        rawInput: 'about-api',
      });

      expect(result.type).toBe('success');
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('📋 Информация о проекте:');
      expect(result.output).toContain('🏷️ Название: SinShell');
      expect(result.output).toContain('📝 Описание: Терминал-стильный веб-сайт');
      expect(result.output).toContain('🔢 Версия: 1.0.0');
      expect(result.output).toContain('🔗 GitHub: https://github.com/sinshell/sinshell');
      expect(apiClient.getAbout).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать ошибки API', async () => {
      const mockError = new ApiClientError('About unavailable', ApiErrorType.NETWORK_ERROR);
      (apiClient.getAbout as jest.Mock).mockRejectedValue(mockError);

      const result = await aboutApiCommand.execute({
        args: [],
        flags: {},
        rawInput: 'about-api',
      });

      expect(result.type).toBe('error');
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('❌ Ошибка при получении информации о проекте');
      expect(apiClient.getAbout).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать неизвестные ошибки', async () => {
      (apiClient.getAbout as jest.Mock).mockRejectedValue(new Error('Unknown error'));

      const result = await aboutApiCommand.execute({
        args: [],
        flags: {},
        rawInput: 'about-api',
      });

      expect(result.type).toBe('error');
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('❌ Ошибка при получении информации о проекте');
      expect(result.output).toContain('Unknown error');
    });
  });

  describe('aboutExtendedCommand', () => {
    it('должен успешно выполнять команду about-extended', async () => {
      const mockExtendedAbout = {
        title: 'SinShell',
        description: 'Терминал-стильный веб-сайт',
        author: 'SinShell Team',
        version: '1.0.0',
        links: [
          { name: 'GitHub', url: 'https://github.com/sinshell/sinshell', icon: '🐙' },
          { name: 'Documentation', url: 'https://docs.sinshell.dev', icon: '📚' },
        ],
        technologies: ['Next.js', 'TypeScript', 'Tailwind CSS'],
        features: [
          'Терминал-стильный интерфейс',
          'Поддержка тем',
          'API интеграция',
        ],
        roadmap: [
          'История команд',
          'Автодополнение',
          'Плагины',
        ],
        contributors: [
          { name: 'John Doe', role: 'Lead Developer', url: 'https://github.com/johndoe' },
          { name: 'Jane Smith', role: 'UI/UX Designer', url: '' },
        ],
      };
      
      (apiClient.getExtendedAbout as jest.Mock).mockResolvedValue(mockExtendedAbout);

      const result = await aboutExtendedCommand.execute({
        args: [],
        flags: {},
        rawInput: 'about-extended',
      });

      expect(result.type).toBe('success');
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('📋 Расширенная информация о проекте:');
      expect(result.output).toContain('🏷️ Название: SinShell');
      expect(result.output).toContain('✨ Возможности:');
      expect(result.output).toContain('🚀 Дорожная карта:');
      expect(result.output).toContain('👥 Контрибьюторы:');
      expect(result.output).toContain('John Doe - Lead Developer (https://github.com/johndoe)');
      expect(result.output).toContain('Jane Smith - UI/UX Designer');
      expect(apiClient.getExtendedAbout).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать ошибки при получении расширенной информации', async () => {
      (apiClient.getExtendedAbout as jest.Mock).mockRejectedValue(new Error('Extended about error'));

      const result = await aboutExtendedCommand.execute({
        args: [],
        flags: {},
        rawInput: 'about-extended',
      });

      expect(result.type).toBe('error');
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('❌ Ошибка при получении расширенной информации');
    });
  });

  describe('projectCommand', () => {
    it('должен успешно выполнять команду project', async () => {
      const mockAbout = {
        title: 'SinShell',
        description: 'Терминал-стильный веб-сайт',
        author: 'SinShell Team',
        version: '1.0.0',
        links: [
          { name: 'GitHub', url: 'https://github.com/sinshell/sinshell', icon: '🐙' },
          { name: 'Documentation', url: 'https://docs.sinshell.dev', icon: '📚' },
        ],
        technologies: ['Next.js', 'TypeScript', 'Tailwind CSS'],
      };
      
      const mockHealth = {
        status: 'ok' as const,
        timestamp: '2024-01-01T12:00:00Z',
      };
      
      (apiClient.getAbout as jest.Mock).mockResolvedValue(mockAbout);
      (apiClient.getHealth as jest.Mock).mockResolvedValue(mockHealth);

      const result = await projectCommand.execute({
        args: [],
        flags: {},
        rawInput: 'project',
      });

      expect(result.type).toBe('success');
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('🟢 SinShell 1.0.0');
      expect(result.output).toContain('📝 Терминал-стильный веб-сайт');
      expect(result.output).toContain('👤 Автор: SinShell Team');
      expect(result.output).toContain('🔗 Проект: https://github.com/sinshell/sinshell');
      expect(result.output).toContain('Статус сервера: Работает');
      expect(apiClient.getAbout).toHaveBeenCalledTimes(1);
      expect(apiClient.getHealth).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать недоступный сервер', async () => {
      const mockAbout = {
        title: 'SinShell',
        description: 'Терминал-стильный веб-сайт',
        author: 'SinShell Team',
        version: '1.0.0',
        links: [
          { name: 'GitHub', url: 'https://github.com/sinshell/sinshell', icon: '🐙' },
          { name: 'Documentation', url: 'https://docs.sinshell.dev', icon: '📚' },
        ],
        technologies: ['Next.js', 'TypeScript', 'Tailwind CSS'],
      };
      
      const mockHealth = {
        status: 'error' as const,
        timestamp: '2024-01-01T12:00:00Z',
      };
      
      (apiClient.getAbout as jest.Mock).mockResolvedValue(mockAbout);
      (apiClient.getHealth as jest.Mock).mockResolvedValue(mockHealth);

      const result = await projectCommand.execute({
        args: [],
        flags: {},
        rawInput: 'project',
      });

      expect(result.type).toBe('success');
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('🔴 SinShell 1.0.0');
      expect(result.output).toContain('Статус сервера: Недоступен');
      expect(apiClient.getAbout).toHaveBeenCalledTimes(1);
      expect(apiClient.getHealth).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать отсутствующую GitHub ссылку', async () => {
      const mockAbout = {
        title: 'SinShell',
        description: 'Терминал-стильный веб-сайт',
        author: 'SinShell Team',
        version: '1.0.0',
        links: [
          { name: 'Documentation', url: 'https://docs.sinshell.dev', icon: '📚' },
        ],
        technologies: ['Next.js', 'TypeScript', 'Tailwind CSS'],
      };
      
      const mockHealth = {
        status: 'ok' as const,
        timestamp: '2024-01-01T12:00:00Z',
      };
      
      (apiClient.getAbout as jest.Mock).mockResolvedValue(mockAbout);
      (apiClient.getHealth as jest.Mock).mockResolvedValue(mockHealth);

      const result = await projectCommand.execute({
        args: [],
        flags: {},
        rawInput: 'project',
      });

      expect(result.type).toBe('success');
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('🔗 Проект: Недоступна');
      expect(apiClient.getAbout).toHaveBeenCalledTimes(1);
      expect(apiClient.getHealth).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать ошибки API', async () => {
      const mockError = new ApiClientError('Project unavailable', ApiErrorType.SERVER_ERROR);
      (apiClient.getAbout as jest.Mock).mockRejectedValue(mockError);

      const result = await projectCommand.execute({
        args: [],
        flags: {},
        rawInput: 'project',
      });

      expect(result.type).toBe('error');
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('❌ Ошибка при получении сводки о проекте');
      expect(apiClient.getAbout).toHaveBeenCalledTimes(1);
      expect(apiClient.getHealth).toHaveBeenCalledTimes(1);
    });
  });

  describe('licenseCommand', () => {
    it('должен успешно выполнять команду license', async () => {
      const mockLicense = {
        name: 'MIT License',
        version: '1.0',
        description: 'Пермиссивная лицензия с минимальными ограничениями',
        permissions: [
          'Коммерческое использование',
          'Модификация',
          'Распространение',
          'Частное использование',
        ],
        conditions: [
          'Включение лицензии и уведомления об авторских правах',
        ],
        limitations: [
          'Ответственность',
          'Гарантия',
        ],
        fullText: 'MIT License\n\nCopyright (c) 2024 SinShell Team\n\nPermission is hereby granted...',
      };
      
      (apiClient.getLicense as jest.Mock).mockResolvedValue(mockLicense);

      const result = await licenseCommand.execute({
        args: [],
        flags: {},
        rawInput: 'license',
      });

      expect(result.type).toBe('success');
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('📄 Лицензия');
      expect(result.output).toContain('📄 Лицензия: MIT License 1.0');
      expect(result.output).toContain('Пермиссивная лицензия с минимальными ограничениями');
      expect(result.output).toContain('✅ Разрешено');
      expect(result.output).toContain('⚠️ Условия');
      expect(result.output).toContain('❌ Запрещено:');
      expect(result.output).toContain('Коммерческое использование');
      expect(apiClient.getLicense).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать лицензию без условий', async () => {
      const mockLicense = {
        name: 'MIT License',
        version: '1.0',
        description: 'Пермиссивная лицензия с минимальными ограничениями',
        permissions: [
          'Коммерческое использование',
          'Модификация',
          'Распространение',
          'Частное использование',
        ],
        conditions: [],
        limitations: [
          'Ответственность',
          'Гарантия',
        ],
        fullText: null,
      };
      
      (apiClient.getLicense as jest.Mock).mockResolvedValue(mockLicense);

      const result = await licenseCommand.execute({
        args: [],
        flags: {},
        rawInput: 'license',
      });

      expect(result.type).toBe('success');
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('📄 Лицензия: MIT License 1.0');
      expect(result.output).toContain('✅ Разрешено');
      expect(result.output).toContain('❌ Запрещено:');
      expect(result.output).not.toContain('⚠️ Условия:');
      expect(result.output).not.toContain('📖 Полный текст лицензии');
      expect(apiClient.getLicense).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать лицензию без ограничений', async () => {
      const mockLicense = {
        name: 'Unlicense',
        version: '1.0',
        description: 'Лицензия без ограничений',
        permissions: [
          'Коммерческое использование',
          'Модификация',
          'Распространение',
          'Частное использование',
        ],
        conditions: [],
        limitations: [],
        fullText: null,
      };
      
      (apiClient.getLicense as jest.Mock).mockResolvedValue(mockLicense);

      const result = await licenseCommand.execute({
        args: [],
        flags: {},
        rawInput: 'license',
      });

      expect(result.type).toBe('success');
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('📄 Лицензия: Unlicense 1.0');
      expect(result.output).toContain('✅ Разрешено');
      expect(result.output).not.toContain('⚠️ Условия:');
      expect(result.output).not.toContain('❌ Запрещено:');
      expect(apiClient.getLicense).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать лицензию с полным текстом', async () => {
      const mockLicense = {
        name: 'MIT License',
        version: '1.0',
        description: 'Пермиссивная лицензия с минимальными ограничениями',
        permissions: [
          'Коммерческое использование',
          'Модификация',
        ],
        conditions: [
          'Включение лицензии',
        ],
        limitations: [
          'Ответственность',
        ],
        fullText: 'MIT License\n\nCopyright (c) 2024 SinShell Team',
      };
      
      (apiClient.getLicense as jest.Mock).mockResolvedValue(mockLicense);

      const result = await licenseCommand.execute({
        args: [],
        flags: {},
        rawInput: 'license',
      });

      expect(result.type).toBe('success');
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('📖 Полный текст лицензии доступен на официальном сайте');
      expect(apiClient.getLicense).toHaveBeenCalledTimes(1);
    });

    it('должен обрабатывать ошибки API', async () => {
      const mockError = new ApiClientError('License unavailable', ApiErrorType.TIMEOUT_ERROR);
      (apiClient.getLicense as jest.Mock).mockRejectedValue(mockError);

      const result = await licenseCommand.execute({
        args: [],
        flags: {},
        rawInput: 'license',
      });

      expect(result.type).toBe('error');
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('❌ Ошибка при получении информации о лицензии');
      expect(apiClient.getLicense).toHaveBeenCalledTimes(1);
    });
  });

  describe('command structure', () => {
    it('должен иметь правильную структуру для aboutApiCommand', () => {
      expect(aboutApiCommand.name).toBe('about-api');
      expect(aboutApiCommand.description).toBe('Получить информацию о проекте с сервера');
      expect(aboutApiCommand.usage).toBe('about-api');
      expect(Array.isArray(aboutApiCommand.examples)).toBe(true);
    });

    it('должен иметь правильную структуру для projectCommand', () => {
      expect(projectCommand.name).toBe('project');
      expect(projectCommand.description).toBe('Получить краткую сводку о проекте');
      expect(projectCommand.usage).toBe('project');
      expect(Array.isArray(projectCommand.examples)).toBe(true);
    });

    it('должен иметь правильную структуру для licenseCommand', () => {
      expect(licenseCommand.name).toBe('license');
      expect(licenseCommand.description).toBe('Получить информацию о лицензии проекта');
      expect(licenseCommand.usage).toBe('license');
      expect(Array.isArray(licenseCommand.examples)).toBe(true);
    });

    it('должен иметь правильную структуру для aboutExtendedCommand', () => {
      expect(aboutExtendedCommand.name).toBe('about-extended');
      expect(aboutExtendedCommand.description).toBe('Получить расширенную информацию о проекте');
      expect(aboutExtendedCommand.usage).toBe('about-extended');
      expect(Array.isArray(aboutExtendedCommand.examples)).toBe(true);
    });
  });
});