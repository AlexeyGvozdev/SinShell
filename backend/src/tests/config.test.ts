describe('Configuration Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Сбрасываем process.env и кэш модуля перед каждым тестом
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Восстанавливаем оригинальный process.env
    process.env = originalEnv;
  });

  describe('Default Configuration', () => {
    it('should have default values', () => {
      const config = require('../config').default;
      expect(config.port).toBeDefined();
      expect(config.env).toBeDefined();
      expect(config.api).toBeDefined();
      expect(config.cors).toBeDefined();
      expect(config.rateLimit).toBeDefined();
      expect(config.database).toBeDefined();
      expect(config.auth).toBeDefined();
    });

    it('should have correct default port', () => {
      const config = require('../config').default;
      expect(config.port).toBe(5001);
    });

    it('should have correct default environment', () => {
      const config = require('../config').default;
      expect(config.env).toBe('test');
    });

    it('should have correct default API configuration', () => {
      const config = require('../config').default;
      expect(config.api.version).toBe('v1');
      expect(config.api.prefix).toBe('/api/v1');
    });

    it('should have correct default CORS configuration', () => {
      const config = require('../config').default;
      expect(config.cors.origin).toBe('http://localhost:3000');
      expect(config.cors.credentials).toBe(true);
    });

    it('should have correct default rate limiting', () => {
      const config = require('../config').default;
      expect(config.rateLimit.windowMs).toBe(900000);
      expect(config.rateLimit.maxRequests).toBe(100);
    });

    it('should have correct default log level', () => {
      const config = require('../config').default;
      // В тестовом окружении лог уровень может быть 'error'
      expect(['info', 'error']).toContain(config.logLevel);
    });
  });

  describe('Environment Variables', () => {
    it('should use PORT from environment', () => {
      process.env.PORT = '3000';
      process.env.NODE_ENV = 'test';
      
      const newConfig = require('../config').default;
      
      expect(newConfig.port).toBe(3000);
    });

    it('should use NODE_ENV from environment', () => {
      process.env.NODE_ENV = 'production';
      
      const newConfig = require('../config').default;
      
      expect(newConfig.env).toBe('production');
    });

    it('should use CORS_ORIGIN from environment', () => {
      process.env.CORS_ORIGIN = 'https://example.com';
      process.env.NODE_ENV = 'test';
      
      const newConfig = require('../config').default;
      
      expect(newConfig.cors.origin).toBe('https://example.com');
    });

    it('should use API_KEY from environment', () => {
      process.env.API_KEY = 'test-api-key';
      process.env.NODE_ENV = 'test';
      
      const newConfig = require('../config').default;
      
      expect(newConfig.apiKey).toBe('test-api-key');
    });

    it('should use LOG_LEVEL from environment', () => {
      process.env.LOG_LEVEL = 'debug';
      process.env.NODE_ENV = 'test';
      
      const newConfig = require('../config').default;
      
      expect(newConfig.logLevel).toBe('debug');
    });

    it('should use RATE_LIMIT_WINDOW_MS from environment', () => {
      process.env.RATE_LIMIT_WINDOW_MS = '60000';
      process.env.NODE_ENV = 'test';
      
      const newConfig = require('../config').default;
      
      expect(newConfig.rateLimit.windowMs).toBe(60000);
    });

    it('should use RATE_LIMIT_MAX_REQUESTS from environment', () => {
      process.env.RATE_LIMIT_MAX_REQUESTS = '50';
      process.env.NODE_ENV = 'test';
      
      const newConfig = require('../config').default;
      
      expect(newConfig.rateLimit.maxRequests).toBe(50);
    });

    it('should use DATABASE_URL from environment', () => {
      process.env.DATABASE_URL = 'mongodb://localhost:27017/test';
      process.env.NODE_ENV = 'test';
      
      const newConfig = require('../config').default;
      
      expect(newConfig.database.url).toBe('mongodb://localhost:27017/test');
    });

    it('should use JWT_SECRET from environment', () => {
      process.env.JWT_SECRET = 'test-jwt-secret';
      process.env.NODE_ENV = 'test';
      
      const newConfig = require('../config').default;
      
      expect(newConfig.auth.jwtSecret).toBe('test-jwt-secret');
    });

    it('should use JWT_EXPIRES_IN from environment', () => {
      process.env.JWT_EXPIRES_IN = '30d';
      process.env.NODE_ENV = 'test';
      
      const newConfig = require('../config').default;
      
      expect(newConfig.auth.jwtExpiresIn).toBe('30d');
    });
  });

  describe('Configuration Validation', () => {
    it('should handle invalid PORT values', () => {
      process.env.PORT = 'invalid';
      process.env.NODE_ENV = 'test';
      
      const newConfig = require('../config').default;
      
      // parseInt с невалидным значением вернет NaN
      expect(isNaN(newConfig.port)).toBe(true);
    });

    it('should handle PORT out of range', () => {
      process.env.PORT = '99999';
      process.env.NODE_ENV = 'test';
      
      const newConfig = require('../config').default;
      
      expect(newConfig.port).toBe(99999);
    });

    it('should handle negative PORT values', () => {
      process.env.PORT = '-1';
      process.env.NODE_ENV = 'test';
      
      const newConfig = require('../config').default;
      
      expect(newConfig.port).toBe(-1);
    });

    it('should handle PORT as string number', () => {
      process.env.PORT = '8080';
      process.env.NODE_ENV = 'test';
      
      const newConfig = require('../config').default;
      
      expect(newConfig.port).toBe(8080);
    });
  });

  describe('Configuration Methods', () => {
    it('should have isDevelopment property', () => {
      const config = require('../config').default;
      expect(typeof config.isDevelopment).toBe('boolean');
    });

    it('should have isProduction property', () => {
      const config = require('../config').default;
      expect(typeof config.isProduction).toBe('boolean');
    });

    it('should have isTest property', () => {
      const config = require('../config').default;
      expect(typeof config.isTest).toBe('boolean');
    });

    it('should correctly identify development environment', () => {
      process.env.NODE_ENV = 'development';
      
      const newConfig = require('../config').default;
      
      expect(newConfig.isDevelopment).toBe(true);
      expect(newConfig.isProduction).toBe(false);
      expect(newConfig.isTest).toBe(false);
    });

    it('should correctly identify production environment', () => {
      process.env.NODE_ENV = 'production';
      
      const newConfig = require('../config').default;
      
      expect(newConfig.isDevelopment).toBe(false);
      expect(newConfig.isProduction).toBe(true);
      expect(newConfig.isTest).toBe(false);
    });

    it('should correctly identify test environment', () => {
      process.env.NODE_ENV = 'test';
      
      const newConfig = require('../config').default;
      
      expect(newConfig.isDevelopment).toBe(false);
      expect(newConfig.isProduction).toBe(false);
      expect(newConfig.isTest).toBe(true);
    });

    it('should handle unknown environment', () => {
      process.env.NODE_ENV = 'staging';
      
      const newConfig = require('../config').default;
      
      expect(newConfig.isDevelopment).toBe(false);
      expect(newConfig.isProduction).toBe(false);
      expect(newConfig.isTest).toBe(false);
    });
  });

  describe('Configuration Edge Cases', () => {
    it('should handle empty environment variables', () => {
      process.env.PORT = '';
      process.env.NODE_ENV = 'test';
      process.env.CORS_ORIGIN = '';
      process.env.API_KEY = '';
      process.env.LOG_LEVEL = '';
      
      const newConfig = require('../config').default;
      
      // Пустая строка для PORT: '' || '5000' = '5000', parseInt('5000', 10) = 5000
      expect(newConfig.port).toBe(5000);
      expect(newConfig.env).toBe('test');
      // Пустая строка для CORS_ORIGIN: '' || 'http://localhost:3000' = 'http://localhost:3000'
      expect(newConfig.cors.origin).toBe('http://localhost:3000');
      // Пустая строка для API_KEY: '' || 'default-api-key' = 'default-api-key'
      expect(newConfig.apiKey).toBe('default-api-key');
      // Пустая строка для LOG_LEVEL: '' || 'info' = 'info'
      expect(newConfig.logLevel).toBe('info');
    });

    it('should handle whitespace-only environment variables', () => {
      process.env.PORT = '   ';
      process.env.NODE_ENV = 'test';
      process.env.CORS_ORIGIN = '   ';
      
      const newConfig = require('../config').default;
      
      // Пробелы для PORT дадут NaN
      expect(isNaN(newConfig.port)).toBe(true);
      expect(newConfig.cors.origin).toBe('   ');
    });

    it('should handle undefined environment variables', () => {
      delete process.env.DATABASE_URL;
      delete process.env.JWT_SECRET;
      
      const newConfig = require('../config').default;
      
      expect(newConfig.database.url).toBeUndefined();
      expect(newConfig.auth.jwtSecret).toBeUndefined();
    });
  });
});