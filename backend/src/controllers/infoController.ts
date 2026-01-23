import { Request, Response } from 'express';
import { SystemInfo, ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import config from '../config';

/**
 * Получение информации о системе
 */
export const getSystemInfo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const uptime = process.uptime();
  const timestamp = new Date().toISOString();
  
  const systemInfo: SystemInfo = {
    name: 'SinShell API',
    version: process.env.npm_package_version || '1.0.0',
    uptime: Math.floor(uptime),
    environment: config.env,
    nodeVersion: process.version,
    timestamp,
  };

  const response: ApiResponse<SystemInfo> = {
    success: true,
    data: systemInfo,
    timestamp,
  };

  res.status(200).json(response);
});

/**
 * Получение информации о API
 */
export const getApiInfo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const timestamp = new Date().toISOString();
  
  const apiInfo = {
    name: 'SinShell API',
    version: process.env.npm_package_version || '1.0.0',
    description: 'Backend API for SinShell terminal-styled website',
    apiVersion: config.api.version,
    baseUrl: `${req.protocol}://${req.get('host')}${config.api.prefix}`,
    endpoints: {
      health: `${config.api.prefix}/health`,
      info: `${config.api.prefix}/info`,
      about: `${config.api.prefix}/about`,
    },
    documentation: `${req.protocol}://${req.get('host')}/docs`,
    timestamp,
  };

  const response: ApiResponse = {
    success: true,
    data: apiInfo,
    timestamp,
  };

  res.status(200).json(response);
});

/**
 * Получение статуса сервера
 */
export const getServerStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  const timestamp = new Date().toISOString();
  
  const serverStatus = {
    status: 'running',
    uptime: {
      seconds: Math.floor(uptime),
      human: formatUptime(uptime),
    },
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
    },
    process: {
      pid: process.pid,
      version: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    environment: config.env,
    timestamp,
  };

  const response: ApiResponse = {
    success: true,
    data: serverStatus,
    timestamp,
  };

  res.status(200).json(response);
});

/**
 * Форматирование uptime в человекочитаемый формат
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}