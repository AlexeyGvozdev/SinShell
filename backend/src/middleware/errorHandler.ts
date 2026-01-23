import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ApiError } from '../types';

/**
 * Кастомный класс ошибки API
 */
export class CustomError extends Error implements ApiError {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: any
  ) {
    super(message);
    this.name = 'CustomError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Сохраняем stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Создание ошибки 400 Bad Request
 */
export function BadRequestError(message: string, details?: any): CustomError {
  return new CustomError(message, 400, 'BAD_REQUEST', details);
}

/**
 * Создание ошибки 401 Unauthorized
 */
export function UnauthorizedError(message: string = 'Unauthorized'): CustomError {
  return new CustomError(message, 401, 'UNAUTHORIZED');
}

/**
 * Создание ошибки 403 Forbidden
 */
export function ForbiddenError(message: string = 'Forbidden'): CustomError {
  return new CustomError(message, 403, 'FORBIDDEN');
}

/**
 * Создание ошибки 404 Not Found
 */
export function NotFoundError(message: string = 'Resource not found'): CustomError {
  return new CustomError(message, 404, 'NOT_FOUND');
}

/**
 * Создание ошибки 409 Conflict
 */
export function ConflictError(message: string, details?: any): CustomError {
  return new CustomError(message, 409, 'CONFLICT', details);
}

/**
 * Создание ошибки 422 Unprocessable Entity
 */
export function ValidationError(message: string, details?: any): CustomError {
  return new CustomError(message, 422, 'VALIDATION_ERROR', details);
}

/**
 * Создание ошибки 429 Too Many Requests
 */
export function RateLimitError(message: string = 'Too many requests'): CustomError {
  return new CustomError(message, 429, 'RATE_LIMIT_EXCEEDED');
}

/**
 * Создание ошибки 500 Internal Server Error
 */
export function InternalServerError(message: string = 'Internal server error', details?: any): CustomError {
  return new CustomError(message, 500, 'INTERNAL_ERROR', details);
}

/**
 * Главный обработчик ошибок
 */
export function errorHandler(
  error: Error | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Если ответ уже отправлен, передаем ошибку дальше
  if (res.headersSent) {
    return next(error);
  }

  const isCustomError = error instanceof CustomError;
  const statusCode = isCustomError ? error.statusCode : 500;
  const code = isCustomError ? error.code : 'INTERNAL_ERROR';
  const message = error.message || 'Internal server error';
  const details = isCustomError ? error.details : undefined;

  // Логируем ошибку
  if (statusCode >= 500) {
    console.error('🚨 Server Error:', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
  } else {
    console.warn('⚠️ Client Error:', {
      error: error.message,
      url: req.url,
      method: req.method,
      ip: req.ip,
    });
  }

  // Формируем ответ
  const response: ApiResponse = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  };

  // В development режиме добавляем больше информации
  if (process.env.NODE_ENV === 'development') {
    response.details = {
      code,
      stack: error.stack,
      ...(details && { details }),
    };
  } else if (details) {
    // В production режиме добавляем только детали, если они есть
    response.details = details;
  }

  res.status(statusCode).json(response);
}

/**
 * Обработчик 404 ошибок
 */
export function notFoundHandler(req: Request, res: Response): void {
  const response: ApiResponse = {
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  };

  res.status(404).json(response);
}

/**
 * Async wrapper для обработки асинхронных ошибок
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Проверка является ли ошибка кастомной
 */
export function isCustomError(error: Error): error is CustomError {
  return error instanceof CustomError;
}