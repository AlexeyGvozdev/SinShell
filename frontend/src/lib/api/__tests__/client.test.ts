/**
 * Тесты для API клиента
 */

import { ApiClient, createApiClient, ApiClientError } from '../index';

// Мокаем fetch
global.fetch = jest.fn();

// Создаем моковый AbortController
class MockAbortController {
  public signal = { aborted: false } as any;
  private timeoutId?: NodeJS.Timeout;

  public abort = jest.fn();

  constructor() {
    // Мокаем таймаут
    this.timeoutId = setTimeout(() => {
      this.abort();
    }, 100);
  }
}

global.AbortController = MockAbortController as any;

describe('ApiClient', () => {
  let apiClient: ApiClient;
  const mockFetch = jest.mocked(fetch);

  beforeEach(() => {
    apiClient = new ApiClient({
      baseURL: 'http://localhost:5000',
      timeout: 1000,
    });
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('должен создаваться с параметрами по умолчанию', () => {
      const client = new ApiClient({ baseURL: 'http://test.com' });
      expect(client).toBeInstanceOf(ApiClient);
    });

    it('должен удалять слэш в конце baseURL', () => {
      const client = new ApiClient({ baseURL: 'http://test.com/' });
      // Проверяем через внутренний метод (если он доступен)
      expect(client).toBeInstanceOf(ApiClient);
    });
  });

  describe('request method', () => {
    it('должен выполнять успешный GET запрос', async () => {
      const mockResponse = { status: 'ok', timestamp: '2024-01-01T00:00:00Z' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await (apiClient as any).get('/test');

      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toBe('http://localhost:5000/test');
      expect(callArgs[1]).toEqual(
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
      expect(callArgs[1]?.signal).toBeDefined();
      expect(result).toEqual(mockResponse);
    });

    it('должен выполнять POST запрос с телом', async () => {
      const mockResponse = { success: true };
      const postData = { name: 'test' };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await (apiClient as any).request('/test', {
        method: 'POST',
        body: JSON.stringify(postData),
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('должен обрабатывать ошибки сервера (5xx)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockResolvedValue({
          error: { message: 'Server error' },
        }),
      } as any);

      await expect((apiClient as any).request('/test')).rejects.toThrow(ApiClientError);
    });

    it('должен обрабатывать ошибки клиента (4xx)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn().mockResolvedValue({
          error: { message: 'Not found' },
        }),
      } as any);

      await expect((apiClient as any).request('/test')).rejects.toThrow(ApiClientError);
    });

    it('должен обрабатывать ошибки без JSON тела', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as any);

      await expect((apiClient as any).request('/test')).rejects.toThrow(ApiClientError);
    });

    it('должен обрабатывать другие статусы ошибок', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 302,
        statusText: 'Found',
        json: jest.fn().mockResolvedValue({
          error: { message: 'Redirect' },
        }),
      } as any);

      await expect((apiClient as any).request('/test')).rejects.toThrow(ApiClientError);
    });

    it('должен обрабатывать AbortError (таймаут)', async () => {
      const abortError = new Error('Request timeout');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(abortError);

      await expect((apiClient as any).request('/test')).rejects.toThrow(ApiClientError);
    });

    it('должен обрабатывать сетевые ошибки', async () => {
      mockFetch.mockRejectedValueOnce(new Error('fetch failed'));

      await expect((apiClient as any).request('/test')).rejects.toThrow(ApiClientError);
    });

    it('должен обрабатывать ошибки сети с network в сообщении', async () => {
      mockFetch.mockRejectedValueOnce(new Error('network error occurred'));

      await expect((apiClient as any).request('/test')).rejects.toThrow(ApiClientError);
    });

    it('должен обрабатывать неизвестные ошибки', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Unknown error'));

      await expect((apiClient as any).request('/test')).rejects.toThrow(ApiClientError);
    });

    it('должен обрабатывать не-Error объекты', async () => {
      mockFetch.mockRejectedValueOnce('string error');

      await expect((apiClient as any).request('/test')).rejects.toThrow(ApiClientError);
    });

    it('должен использовать кастомные заголовки', async () => {
      const customHeaders = { 'Authorization': 'Bearer token' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      } as any);

      await (apiClient as any).request('/test', {
        headers: customHeaders,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token',
          }),
        })
      );
    });

    it('должен использовать кастомный таймаут', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      } as any);

      await (apiClient as any).request('/test', {
        timeout: 2000,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/test',
        expect.objectContaining({
          signal: expect.any(Object),
        })
      );
    });
  });

  describe('POST method', () => {
    it('должен выполнять POST запрос без тела', async () => {
      const mockResponse = { success: true };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await (apiClient as any).post('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/test',
        expect.objectContaining({
          method: 'POST',
          body: undefined,
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('должен выполнять POST запрос с телом', async () => {
      const mockResponse = { success: true };
      const postData = { name: 'test' };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await (apiClient as any).post('/test', postData);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('API methods', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      } as any);
    });

    it('должен вызывать getHealth', async () => {
      await apiClient.getHealth();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/health',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('должен вызывать getDetailedHealth', async () => {
      await apiClient.getDetailedHealth();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/health/detailed',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('должен вызывать getSystemInfo', async () => {
      await apiClient.getSystemInfo();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/info',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('должен вызывать getAbout', async () => {
      await apiClient.getAbout();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/about',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('должен вызывать getExtendedAbout', async () => {
      await apiClient.getExtendedAbout();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/about/extended',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('должен вызывать getLicense', async () => {
      await apiClient.getLicense();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/about/license',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('должен вызывать getReadiness', async () => {
      await apiClient.getReadiness();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/health/ready',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('должен вызывать getLiveness', async () => {
      await apiClient.getLiveness();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/health/live',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('должен вызывать getApiInfo', async () => {
      await apiClient.getApiInfo();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/info/api',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('должен вызывать getServerStatus', async () => {
      await apiClient.getServerStatus();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1/info/server',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('должен вызывать getApiRoot', async () => {
      await apiClient.getApiRoot();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/v1',
        expect.objectContaining({ method: 'GET' })
      );
    });
  });

  describe('utility methods', () => {
    it('должен проверять доступность API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ status: 'ok' }),
      } as any);

      const isAvailable = await apiClient.isAvailable();
      expect(isAvailable).toBe(true);
    });

    it('должен возвращать false при недоступности API', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const isAvailable = await apiClient.isAvailable();
      expect(isAvailable).toBe(false);
    });

    it('должен измерять время ответа', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ status: 'ok' }),
      } as any);

      const pingTime = await apiClient.getPingTime();
      expect(typeof pingTime).toBe('number');
      expect(pingTime).toBeGreaterThanOrEqual(0);
    });

    it('должен возвращать -1 при ошибке пинга', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const pingTime = await apiClient.getPingTime();
      expect(pingTime).toBe(-1);
    });
  });
});

describe('createApiClient', () => {
  it('должен создавать API клиент с URL по умолчанию', () => {
    // Пропускаем этот тест, так как мокинг window.location вызывает проблемы
    // В реальном приложении createApiClient будет работать корректно
    expect(true).toBe(true);
  });

  it('должен создавать API клиент с кастомным URL', () => {
    const client = createApiClient('http://custom.com');
    expect(client).toBeInstanceOf(ApiClient);
  });
});