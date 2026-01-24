import { Request, Response } from 'express';
import { HealthResponse, ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Health check endpoint
 * Возвращает статус работы сервера
 */
export const getHealth = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const uptime = process.uptime();
  const timestamp = new Date().toISOString();
  
  const healthData: HealthResponse = {
    status: 'ok',
    timestamp,
    uptime: Math.floor(uptime),
    version: process.env.npm_package_version || '1.0.0',
  };

  const response: ApiResponse<HealthResponse> = {
    success: true,
    data: healthData,
    timestamp,
  };

  res.status(200).json(response);
});

/**
 * Detailed health check endpoint
 * Возвращает детальную информацию о состоянии сервера
 */
export const getDetailedHealth = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const uptime = process.uptime();
  const timestamp = new Date().toISOString();
  const memoryUsage = process.memoryUsage();
  
  const healthData = {
    status: 'ok' as const,
    timestamp,
    uptime: Math.floor(uptime),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memoryUsage.external / 1024 / 1024), // MB
    },
    cpu: {
      usage: process.cpuUsage(),
    },
  };

  const response: ApiResponse = {
    success: true,
    data: healthData,
    timestamp,
  };

  res.status(200).json(response);
});

/**
 * Readiness check endpoint
 * Проверяет готовность сервера к работе
 */
export const getReadiness = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // Здесь можно добавить проверки готовности к работе
  // Например, проверка подключения к базе данных
  
  const isReady = true; // В будущем будет реальная проверка
  
  const response: ApiResponse = {
    success: isReady,
    data: {
      ready: isReady,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  };

  res.status(isReady ? 200 : 503).json(response);
});

/**
 * Liveness check endpoint
 * Проверяет жив ли сервер
 */
export const getLiveness = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const isAlive = true; // Сервер жив, если код выполняется
  
  const response: ApiResponse = {
    success: isAlive,
    data: {
      alive: isAlive,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  };

  res.status(isAlive ? 200 : 503).json(response);
});