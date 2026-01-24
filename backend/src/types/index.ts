import { Request, Response } from 'express';

/**
 * Базовый API ответ
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
  details?: any;
}

/**
 * Информация о системе
 */
export interface SystemInfo {
  name: string;
  version: string;
  uptime: number;
  environment: string;
  nodeVersion: string;
  timestamp: string;
}

/**
 * Информация о проекте
 */
export interface AboutInfo {
  title: string;
  description: string;
  author: string;
  version: string;
  links: Array<{
    name: string;
    url: string;
    icon?: string;
  }>;
  technologies: string[];
}

/**
 * Health check ответ
 */
export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime?: number;
  version?: string;
}

/**
 * Расширенный Request с пользовательскими полями
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    roles: string[];
  };
}

/**
 * Ошибка API
 */
export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

/**
 * Middleware функция
 */
export type MiddlewareFunction = (
  req: Request | AuthenticatedRequest,
  res: Response,
  next: (err?: any) => void
) => void | Promise<void>;

/**
 * Контроллер функция
 */
export type ControllerFunction = (
  req: Request | AuthenticatedRequest,
  res: Response
) => void | Promise<void>;

/**
 * Параметры пагинации
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Пагинированный ответ
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Лог уровень
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

/**
 * Контекст лога
 */
export interface LogContext {
  requestId?: string;
  userId?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  responseTime?: number;
  userAgent?: string;
  ip?: string;
  [key: string]: any; // Разрешаем дополнительные поля
}

/**
 * Структура лога
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: Error;
}