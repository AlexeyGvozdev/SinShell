import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { LogLevel, LogContext, LogEntry } from '../types';
import config from '../config';

/**
 * Кастомный логгер
 */
class Logger {
  private logLevel: LogLevel;

  constructor() {
    this.logLevel = config.logLevel as LogLevel;
  }

  /**
   * Проверка уровня лога
   */
  public shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };

    return levels[level] <= levels[this.logLevel];
  }

  /**
   * Форматирование лога
   */
  public formatLog(level: LogLevel, message: string, context?: LogContext, error?: Error): string {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      level,
      message,
      timestamp,
      ...(context && { context }),
      ...(error && { error }),
    };

    return JSON.stringify(logEntry);
  }

  /**
   * Логирование ошибки
   */
  error(message: string, context?: LogContext, error?: Error): void {
    if (this.shouldLog('error')) {
      const log = this.formatLog('error', message, context, error);
      console.error(log);
    }
  }

  /**
   * Логирование предупреждения
   */
  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      const log = this.formatLog('warn', message, context);
      console.warn(log);
    }
  }

  /**
   * Логирование информации
   */
  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      const log = this.formatLog('info', message, context);
      console.log(log);
    }
  }

  /**
   * Логирование отладочной информации
   */
  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      const log = this.formatLog('debug', message, context);
      console.debug(log);
    }
  }
}

// Экспортируем singleton
export const logger = new Logger();

/**
 * Создание контекста лога из запроса
 */
export function createLogContext(req: Request): LogContext {
  const context: LogContext = {
    method: req.method,
    url: req.url,
  };
  
  if (req.get('User-Agent')) {
    context.userAgent = req.get('User-Agent')!;
  }
  
  const ip = req.ip || req.socket?.remoteAddress;
  if (ip) {
    context.ip = ip;
  }
  
  return context;
}

/**
 * Morgan middleware для HTTP логов
 */
export const httpLogger = morgan((tokens, req, res) => {
  const status = parseInt(tokens.status?.(req, res) || '0', 10);
  const level: LogLevel = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';

  if (!logger.shouldLog(level)) {
    return '';
  }

  const context: LogContext = {
    statusCode: status,
    responseTime: parseFloat(tokens['response-time']?.(req, res) || '0'),
  };
  
  const method = tokens.method?.(req, res);
  if (method) {
    context.method = method;
  }
  
  const url = tokens.url?.(req, res);
  if (url) {
    context.url = url;
  }
  
  const userAgent = tokens['user-agent']?.(req, res);
  if (userAgent) {
    context.userAgent = userAgent;
  }
  
  const remoteAddr = tokens['remote-addr']?.(req, res);
  if (remoteAddr) {
    context.ip = remoteAddr;
  }

  const message = `${context.method} ${context.url} ${status} - ${context.responseTime}ms`;

  return logger.formatLog(level, message, context);
});

/**
 * Middleware для добавления request ID
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = generateRequestId();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
}

/**
 * Генерация уникального ID запроса
 */
function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Middleware для логирования запросов
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const context = createLogContext(req);

  // Логируем начало запроса
  logger.info(`Request started: ${req.method} ${req.url}`, context);

  // Перехватываем завершение ответа
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logContext: LogContext = {
      ...context,
      statusCode: res.statusCode,
      responseTime: duration,
    };

    logger.info(
      `Request completed: ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`,
      logContext
    );
  });

  next();
}

/**
 * Middleware для логирования ошибок запросов
 */
export function errorLogger(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const context: LogContext = {
    ...createLogContext(req),
    statusCode: res.statusCode,
  };

  logger.error(
    `Request error: ${req.method} ${req.url} - ${error.message}`,
    context,
    error
  );

  next(error);
}

export default logger;