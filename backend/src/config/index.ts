import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

/**
 * Конфигурация приложения
 */
export const config = {
  // Сервер
  port: parseInt(process.env.PORT || '5000', 10),
  env: process.env.NODE_ENV || 'development',
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  
  // Безопасность
  apiKey: process.env.API_KEY || 'default-api-key',
  
  // Логирование
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 минут
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  // API
  api: {
    version: 'v1',
    prefix: '/api/v1',
  },
  
  // Будущие настройки
  database: {
    url: process.env.DATABASE_URL,
  },
  
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // Проверка окружения
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

/**
 * Валидация конфигурации
 */
export function validateConfig(): void {
  const requiredVars = ['PORT'];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Required environment variable ${varName} is not set`);
    }
  }
  
  // Валидация порта
  if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
    throw new Error('Invalid PORT value. Must be between 1 and 65535');
  }
  
  // В development режиме выводим конфигурацию
  if (config.isDevelopment) {
    console.log('🔧 Configuration loaded:', {
      port: config.port,
      env: config.env,
      corsOrigin: config.cors.origin,
      logLevel: config.logLevel,
    });
  }
}

/**
 * Получение полного URL API
 */
export function getApiUrl(): string {
  return `${config.api.prefix}/${config.api.version}`;
}

export default config;