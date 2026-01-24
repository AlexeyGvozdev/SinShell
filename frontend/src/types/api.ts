/**
 * Типы для API ответов от backend
 */

// Базовый тип для успешного ответа
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp?: string;
}

// Базовый тип для ошибки
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: string;
  };
}

// Health Check типы
export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
}

export interface DetailedHealthResponse extends HealthResponse {
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
  environment: string;
}

// Info типы
export interface SystemInfoResponse {
  name: string;
  version: string;
  uptime: number;
  environment: string;
  nodeVersion: string;
}

export interface ApiInfoResponse {
  name: string;
  version: string;
  description: string;
  endpoints: string[];
  documentation?: string;
}

export interface ServerStatusResponse {
  status: 'running' | 'stopped' | 'error';
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
  environment: string;
  timestamp: string;
}

// About типы
export interface Link {
  name: string;
  url: string;
  icon: string;
}

export interface AboutResponse {
  title: string;
  description: string;
  author: string;
  version: string;
  links: Link[];
  technologies: string[];
}

export interface ExtendedAboutResponse extends AboutResponse {
  features: string[];
  roadmap: string[];
  contributors: Array<{
    name: string;
    role: string;
    url?: string;
  }>;
}

export interface LicenseResponse {
  name: string;
  version: string;
  description: string;
  permissions: string[];
  conditions: string[];
  limitations: string[];
  fullText?: string;
}

// API Root тип
export interface ApiRootResponse {
  success: true;
  message: string;
  version: string;
  description: string;
  endpoints: {
    health: string;
    info: string;
    about: string;
  };
  documentation: string;
  timestamp: string;
}

// Типы для параметров запроса
export interface ApiRequestOptions {
  timeout?: number;
  headers?: Record<string, string>;
}

// Типы для конфигурации API клиента
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
}