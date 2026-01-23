import dotenv from 'dotenv';
import { createApp } from './app';
import { logger } from './middleware/logger';

// Загрузка переменных окружения
dotenv.config();

// Получение порта из переменных окружения или использование значения по умолчанию
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer() {
  try {
    // Создание Express приложения
    const app = createApp();
    
    // Запуск сервера
    const server = app.listen(PORT, () => {
      logger.info(`🚀 SinShell Backend Server started successfully!`);
      logger.info(`📍 Server running on port: ${PORT}`);
      logger.info(`🌍 Environment: ${NODE_ENV}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api/v1/info`);
      logger.info(`🏠 About: http://localhost:${PORT}/api/v1/about`);
      logger.info('');
      logger.info('🎯 Available endpoints:');
      logger.info('   GET  /health                    - Basic health check');
      logger.info('   GET  /api/v1/health            - API health check');
      logger.info('   GET  /api/v1/info              - System information');
      logger.info('   GET  /api/v1/about             - About project');
      logger.info('');
    });

    // Обработка ошибок сервера
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

      switch (error.code) {
        case 'EACCES':
          logger.error(`❌ ${bind} requires elevated privileges`);
          process.exit(1);
        case 'EADDRINUSE':
          logger.error(`❌ ${bind} is already in use`);
          process.exit(1);
        default:
          throw error;
      }
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`\n📡 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(() => {
        logger.info('✅ HTTP server closed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Обработка сигналов для graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
  } catch (error) {
    logger.error('💥 Failed to start server:', { error: error instanceof Error ? error.message : String(error) });
    process.exit(1);
  }
}

// Обработка необработанных исключений
process.on('uncaughtException', (error: Error) => {
  logger.error('💥 Uncaught Exception:', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('💥 Unhandled Rejection at:', { promise: promise.toString(), reason: String(reason) });
  process.exit(1);
});

// Запуск сервера
if (require.main === module) {
  startServer();
}

export { startServer };