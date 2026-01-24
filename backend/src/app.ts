import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

import config, { validateConfig } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { httpLogger, requestIdMiddleware, requestLogger, errorLogger } from './middleware/logger';
import routes from './routes';

/**
 * Создание и конфигурация Express приложения
 */
export function createApp(): Application {
  // Валидация конфигурации
  validateConfig();

  // Создание Express приложения
  const app: Application = express();

  // Доверяем прокси (если используется)
  app.set('trust proxy', 1);

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // CORS middleware
  app.use(cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Request-ID'],
  }));

  // Compression middleware
  app.use(compression());

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request ID middleware
  app.use(requestIdMiddleware);

  // HTTP logging middleware
  if (config.isDevelopment) {
    app.use(morgan('dev'));
  } else {
    app.use(httpLogger);
  }

  // Request logging middleware
  app.use(requestLogger);

  // Health check endpoint (без логирования)
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    });
  });

  // API routes
  app.use(config.api.prefix, routes);

  // Root endpoint
  app.get('/', (req: Request, res: Response) => {
    res.json({
      name: 'SinShell API',
      version: '1.0.0',
      description: 'Backend API for SinShell terminal-styled website',
      endpoints: {
        health: '/health',
        api: `${config.api.prefix}`,
        documentation: `${req.protocol}://${req.get('host')}/docs`,
      },
      timestamp: new Date().toISOString(),
    });
  });

  // 404 handler
  app.use(notFoundHandler);

  // Error logger middleware
  app.use(errorLogger);

  // Global error handler
  app.use(errorHandler);

  return app;
}

/**
 * Graceful shutdown handler
 */
export function setupGracefulShutdown(app: Application): void {
  // Note: Graceful shutdown is handled in index.ts with the server instance
  // This function is kept for compatibility but doesn't handle server closing
  console.log('📡 Graceful shutdown setup - server closing handled in index.ts');
}

export default createApp;