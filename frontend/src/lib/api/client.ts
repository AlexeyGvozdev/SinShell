/**
 * API клиент для взаимодействия с backend SinShell
 */

import {
  ApiClientConfig,
  ApiResponse,
  ApiRequestOptions,
  HealthResponse,
  DetailedHealthResponse,
  SystemInfoResponse,
  ApiInfoResponse,
  ServerStatusResponse,
  AboutResponse,
  ExtendedAboutResponse,
  LicenseResponse,
  ApiRootResponse,
} from '@/types/api';
import { ApiError, ApiErrorType } from './utils';

/**
 * Класс API клиента
 */
export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, ''); // Удаляем слэш в конце
    this.timeout = config.timeout || 5000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.defaultHeaders,
    };
  }

  /**
   * Выполняет HTTP запрос
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit & { timeout?: number } = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const timeout = options.timeout || this.timeout;

    // Создаем AbortController для таймаута
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Проверяем статус ответа
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          if (errorData.error && errorData.error.message) {
            errorMessage = errorData.error.message;
          }
        } catch {
          // Если не удалось распарсить JSON, используем сообщение по умолчанию
        }

        // Создаем соответствующую ошибку
        if (response.status >= 500) {
          throw ApiError.server(errorMessage, response.status);
        } else if (response.status >= 400) {
          throw ApiError.client(errorMessage, response.status);
        } else {
          throw ApiError.unknown(errorMessage);
        }
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw ApiError.timeout();
        }
        
        // Проверяем на сетевые ошибки
        if (error.message.includes('fetch') || error.message.includes('network')) {
          throw ApiError.network(error.message, error);
        }
        
        throw ApiError.unknown(error.message, error);
      }

      throw ApiError.unknown('Unknown error occurred', error);
    }
  }

  /**
   * GET запрос
   */
  private async get<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      timeout: options.timeout,
      headers: options.headers,
    });
  }

  /**
   * POST запрос
   */
  private async post<T>(
    endpoint: string,
    data?: any,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      timeout: options.timeout,
      headers: options.headers,
    });
  }

  // === Health Endpoints ===

  /**
   * Базовая проверка здоровья
   */
  async getHealth(): Promise<HealthResponse> {
    return this.get<HealthResponse>('/api/v1/health');
  }

  /**
   * Детальная проверка здоровья
   */
  async getDetailedHealth(): Promise<DetailedHealthResponse> {
    return this.get<DetailedHealthResponse>('/api/v1/health/detailed');
  }

  /**
   * Readiness probe
   */
  async getReadiness(): Promise<HealthResponse> {
    return this.get<HealthResponse>('/api/v1/health/ready');
  }

  /**
   * Liveness probe
   */
  async getLiveness(): Promise<HealthResponse> {
    return this.get<HealthResponse>('/api/v1/health/live');
  }

  // === Info Endpoints ===

  /**
   * Получение информации о системе
   */
  async getSystemInfo(): Promise<SystemInfoResponse> {
    return this.get<SystemInfoResponse>('/api/v1/info');
  }

  /**
   * Получение информации об API
   */
  async getApiInfo(): Promise<ApiInfoResponse> {
    return this.get<ApiInfoResponse>('/api/v1/info/api');
  }

  /**
   * Получение статуса сервера
   */
  async getServerStatus(): Promise<ServerStatusResponse> {
    return this.get<ServerStatusResponse>('/api/v1/info/server');
  }

  // === About Endpoints ===

  /**
   * Получение базовой информации о проекте
   */
  async getAbout(): Promise<AboutResponse> {
    return this.get<AboutResponse>('/api/v1/about');
  }

  /**
   * Получение расширенной информации о проекте
   */
  async getExtendedAbout(): Promise<ExtendedAboutResponse> {
    return this.get<ExtendedAboutResponse>('/api/v1/about/extended');
  }

  /**
   * Получение информации о лицензии
   */
  async getLicense(): Promise<LicenseResponse> {
    return this.get<LicenseResponse>('/api/v1/about/license');
  }

  // === Root Endpoint ===

  /**
   * Получение информации об API
   */
  async getApiRoot(): Promise<ApiRootResponse> {
    return this.get<ApiRootResponse>('/api/v1');
  }

  // === Utility Methods ===

  /**
   * Проверка доступности API
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.getHealth();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Получение времени ответа API
   */
  async getPingTime(): Promise<number> {
    const start = performance.now();
    try {
      await this.getHealth();
      return performance.now() - start;
    } catch {
      return -1;
    }
  }
}

/**
 * Создание экземпляра API клиента с конфигурацией по умолчанию
 */
export const createApiClient = (baseURL?: string): ApiClient => {
  // Определяем базовый URL в зависимости от окружения
  const defaultBaseURL = 
    typeof window !== 'undefined' 
      ? window.location.origin // В браузере используем текущий домен
      : 'http://localhost:5000'; // В серверном окружении используем localhost

  return new ApiClient({
    baseURL: baseURL || defaultBaseURL,
    timeout: 5000,
    defaultHeaders: {
      'User-Agent': 'SinShell-Frontend/1.0.0',
    },
  });
};

/**
 * Экземпляр API клиента по умолчанию
 */
export const apiClient = createApiClient();