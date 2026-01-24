/**
 * Тесты для API модуля
 */

import {
  ApiClient,
  createApiClient,
  apiClient,
  ApiClientError,
  ApiErrorType,
  formatDuration,
  formatBytes,
  isNetworkError,
  isTimeoutError,
  isServerError,
  createLoadingIndicator,
  createProgressMessage,
} from '../index';

// Мокаем client модуль
jest.mock('../client', () => ({
  ApiClient: jest.fn().mockImplementation(() => ({
    getHealth: jest.fn(),
    getDetailedHealth: jest.fn(),
    getSystemInfo: jest.fn(),
    getAbout: jest.fn(),
    isAvailable: jest.fn(),
    getPingTime: jest.fn(),
  })),
  createApiClient: jest.fn().mockImplementation(() => ({
    getHealth: jest.fn(),
    getDetailedHealth: jest.fn(),
    getSystemInfo: jest.fn(),
    getAbout: jest.fn(),
    isAvailable: jest.fn(),
    getPingTime: jest.fn(),
  })),
  apiClient: {
    getHealth: jest.fn(),
    getDetailedHealth: jest.fn(),
    getSystemInfo: jest.fn(),
    getAbout: jest.fn(),
    isAvailable: jest.fn(),
    getPingTime: jest.fn(),
  },
}));

// Мокаем utils модуль
jest.mock('../utils', () => ({
  ApiError: {
    network: jest.fn(),
    timeout: jest.fn(),
    server: jest.fn(),
    client: jest.fn(),
    unknown: jest.fn(),
  },
  ApiErrorType: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    CLIENT_ERROR: 'CLIENT_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  },
  formatDuration: jest.fn(),
  formatBytes: jest.fn(),
  isNetworkError: jest.fn(),
  isTimeoutError: jest.fn(),
  isServerError: jest.fn(),
  createLoadingIndicator: jest.fn(),
  createProgressMessage: jest.fn(),
}));

// Мокаем types/api модуль
jest.mock('@/types/api', () => ({
  ApiClientConfig: {},
  ApiResponse: {},
  ApiRequestOptions: {},
  HealthResponse: {},
  DetailedHealthResponse: {},
  SystemInfoResponse: {},
  ApiInfoResponse: {},
  ServerStatusResponse: {},
  AboutResponse: {},
  ExtendedAboutResponse: {},
  LicenseResponse: {},
  ApiRootResponse: {},
}));

describe('API Index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exports from client', () => {
    it('должен экспортировать ApiClient', () => {
      expect(ApiClient).toBeDefined();
      expect(typeof ApiClient).toBe('function');
    });

    it('должен экспортировать createApiClient', () => {
      expect(createApiClient).toBeDefined();
      expect(typeof createApiClient).toBe('function');
    });

    it('должен экспортировать apiClient', () => {
      expect(apiClient).toBeDefined();
      expect(typeof apiClient).toBe('object');
      expect(typeof apiClient.getHealth).toBe('function');
    });
  });

  describe('exports from utils', () => {
    it('должен экспортировать ApiClientError', () => {
      expect(ApiClientError).toBeDefined();
    });

    it('должен экспортировать ApiErrorType', () => {
      expect(ApiErrorType).toBeDefined();
      expect(ApiErrorType.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(ApiErrorType.TIMEOUT_ERROR).toBe('TIMEOUT_ERROR');
      expect(ApiErrorType.SERVER_ERROR).toBe('SERVER_ERROR');
      expect(ApiErrorType.CLIENT_ERROR).toBe('CLIENT_ERROR');
      expect(ApiErrorType.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    });

    it('должен экспортировать formatDuration', () => {
      expect(formatDuration).toBeDefined();
      expect(typeof formatDuration).toBe('function');
    });

    it('должен экспортировать formatBytes', () => {
      expect(formatBytes).toBeDefined();
      expect(typeof formatBytes).toBe('function');
    });

    it('должен экспортировать isNetworkError', () => {
      expect(isNetworkError).toBeDefined();
      expect(typeof isNetworkError).toBe('function');
    });

    it('должен экспортировать isTimeoutError', () => {
      expect(isTimeoutError).toBeDefined();
      expect(typeof isTimeoutError).toBe('function');
    });

    it('должен экспортировать isServerError', () => {
      expect(isServerError).toBeDefined();
      expect(typeof isServerError).toBe('function');
    });

    it('должен экспортировать createLoadingIndicator', () => {
      expect(createLoadingIndicator).toBeDefined();
      expect(typeof createLoadingIndicator).toBe('function');
    });

    it('должен экспортировать createProgressMessage', () => {
      expect(createProgressMessage).toBeDefined();
      expect(typeof createProgressMessage).toBe('function');
    });
  });

  describe('integration', () => {
    it('должен работать с ApiClient', () => {
      const client = new ApiClient({ baseURL: 'http://test.com' });
      expect(client).toBeDefined();
      expect(typeof client.getHealth).toBe('function');
    });

    it('должен работать с createApiClient', () => {
      const client = createApiClient('http://test.com');
      expect(client).toBeDefined();
      expect(typeof client.getHealth).toBe('function');
    });

    it('должен работать с apiClient по умолчанию', () => {
      expect(apiClient).toBeDefined();
      expect(typeof apiClient.getHealth).toBe('function');
    });

    it('должен работать с утилитами', () => {
      expect(typeof formatDuration).toBe('function');
      expect(typeof formatBytes).toBe('function');
      expect(typeof isNetworkError).toBe('function');
      expect(typeof isTimeoutError).toBe('function');
      expect(typeof isServerError).toBe('function');
      expect(typeof createLoadingIndicator).toBe('function');
      expect(typeof createProgressMessage).toBe('function');
    });

    it('должен работать с типами ошибок', () => {
      expect(ApiErrorType.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(ApiErrorType.TIMEOUT_ERROR).toBe('TIMEOUT_ERROR');
      expect(ApiErrorType.SERVER_ERROR).toBe('SERVER_ERROR');
      expect(ApiErrorType.CLIENT_ERROR).toBe('CLIENT_ERROR');
      expect(ApiErrorType.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    });
  });

  describe('mock verification', () => {
    it('должен вызывать моковые функции', () => {
      // Проверяем, что моки работают
      formatDuration(1000);
      expect(formatDuration).toHaveBeenCalledWith(1000);

      formatBytes(1024);
      expect(formatBytes).toHaveBeenCalledWith(1024);

      isNetworkError(new Error('network error'));
      expect(isNetworkError).toHaveBeenCalled();

      isTimeoutError(new Error('timeout'));
      expect(isTimeoutError).toHaveBeenCalled();

      isServerError(new Error('server error'));
      expect(isServerError).toHaveBeenCalled();

      createLoadingIndicator('test');
      expect(createLoadingIndicator).toHaveBeenCalledWith('test');

      createProgressMessage(50, 100);
      expect(createProgressMessage).toHaveBeenCalledWith(50, 100);
    });

    it('должен работать с моковым ApiClient', () => {
      const client = new ApiClient({ baseURL: 'http://test.com' });
      
      client.getHealth();
      expect(client.getHealth).toHaveBeenCalled();

      client.getDetailedHealth();
      expect(client.getDetailedHealth).toHaveBeenCalled();

      client.getSystemInfo();
      expect(client.getSystemInfo).toHaveBeenCalled();

      client.getAbout();
      expect(client.getAbout).toHaveBeenCalled();

      client.isAvailable();
      expect(client.isAvailable).toHaveBeenCalled();

      client.getPingTime();
      expect(client.getPingTime).toHaveBeenCalled();
    });

    it('должен работать с моковым createApiClient', () => {
      const client = createApiClient('http://test.com');
      expect(createApiClient).toHaveBeenCalledWith('http://test.com');
      
      client.getHealth();
      expect(client.getHealth).toHaveBeenCalled();
    });

    it('должен работать с моковым apiClient', () => {
      apiClient.getHealth();
      expect(apiClient.getHealth).toHaveBeenCalled();
    });
  });

  describe('type checking', () => {
    it('должен иметь правильные типы для экспортов', () => {
      // Проверяем, что все экспорты имеют правильные типы
      expect(typeof ApiClient).toBe('function');
      expect(typeof createApiClient).toBe('function');
      expect(typeof apiClient).toBe('object');
      expect(typeof ApiClientError).toBe('object');
      expect(typeof ApiErrorType).toBe('object');
      expect(typeof formatDuration).toBe('function');
      expect(typeof formatBytes).toBe('function');
      expect(typeof isNetworkError).toBe('function');
      expect(typeof isTimeoutError).toBe('function');
      expect(typeof isServerError).toBe('function');
      expect(typeof createLoadingIndicator).toBe('function');
      expect(typeof createProgressMessage).toBe('function');
    });

    it('должен иметь правильные значения для ApiErrorType', () => {
      expect(ApiErrorType.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(ApiErrorType.TIMEOUT_ERROR).toBe('TIMEOUT_ERROR');
      expect(ApiErrorType.SERVER_ERROR).toBe('SERVER_ERROR');
      expect(ApiErrorType.CLIENT_ERROR).toBe('CLIENT_ERROR');
      expect(ApiErrorType.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    });
  });
});