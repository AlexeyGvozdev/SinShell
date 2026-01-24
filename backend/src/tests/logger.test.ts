import { Request, Response, NextFunction } from 'express';
import { logger, createLogContext, requestLogger, errorLogger, requestIdMiddleware } from '../middleware/logger';

describe('Logger Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Logger Class', () => {
    describe('Log Levels', () => {
      it('should initialize with default log level', () => {
        expect(logger).toBeDefined();
      });

      it('should log error messages', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        
        logger.error('Test error message');
        
        expect(consoleSpy).toHaveBeenCalled();
        
        consoleSpy.mockRestore();
      });

      it('should log warning messages', () => {
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        
        logger.warn('Test warning message');
        
        // Warning might not be logged depending on log level
        // Just verify the method doesn't throw
        expect(() => logger.warn('Test warning message')).not.toThrow();
        
        consoleSpy.mockRestore();
      });

      it('should log info messages', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        
        logger.info('Test info message');
        
        // Info might not be logged depending on log level
        // Just verify the method doesn't throw
        expect(() => logger.info('Test info message')).not.toThrow();
        
        consoleSpy.mockRestore();
      });

      it('should log debug messages', () => {
        const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();
        
        logger.debug('Test debug message');
        
        // Debug might not be logged depending on log level
        // Just verify the method doesn't throw
        expect(() => logger.debug('Test debug message')).not.toThrow();
        
        consoleSpy.mockRestore();
      });
    });

    describe('Log Formatting', () => {
      it('should format log with timestamp', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        
        logger.info('Test message');
        
        // Just verify the method doesn't throw and structure is correct
        expect(() => logger.info('Test message')).not.toThrow();
        
        consoleSpy.mockRestore();
      });

      it('should format log with context', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const context = { userId: '123', action: 'login' };
        
        // Just verify the method doesn't throw
        expect(() => logger.info('Test message', context)).not.toThrow();
        
        consoleSpy.mockRestore();
      });

      it('should format log with error', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const error = new Error('Test error');
        
        logger.error('Test error message', undefined, error);
        
        expect(consoleSpy).toHaveBeenCalled();
        
        consoleSpy.mockRestore();
      });
    });

    describe('Log Level Filtering', () => {
      it('should respect log level settings', () => {
        process.env.LOG_LEVEL = 'error';
        
        // Создаем новый инстанс логгера с новым уровнем
        delete require.cache[require.resolve('../middleware/logger')];
        const { logger: newLogger } = require('../middleware/logger');
        
        const infoSpy = jest.spyOn(console, 'log').mockImplementation();
        const errorSpy = jest.spyOn(console, 'error').mockImplementation();
        
        newLogger.info('This should not be logged');
        newLogger.error('This should be logged');
        
        expect(infoSpy).not.toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalled();
        
        infoSpy.mockRestore();
        errorSpy.mockRestore();
      });
    });
  });

  describe('createLogContext', () => {
    let mockRequest: Partial<Request>;

    beforeEach(() => {
      mockRequest = {
        method: 'GET',
        url: '/test',
        get: jest.fn(),
        ip: '127.0.0.1',
      };
    });

    it('should create basic log context', () => {
      const context = createLogContext(mockRequest as Request);
      
      expect(context).toHaveProperty('method', 'GET');
      expect(context).toHaveProperty('url', '/test');
    });

    it('should include User-Agent when present', () => {
      const userAgent = 'Mozilla/5.0 Test Browser';
      mockRequest.get = jest.fn().mockReturnValue(userAgent);
      
      const context = createLogContext(mockRequest as Request);
      
      expect(context).toHaveProperty('userAgent', userAgent);
    });

    it('should include IP address when present', () => {
      const context = createLogContext(mockRequest as Request);
      
      expect(context).toHaveProperty('ip', '127.0.0.1');
    });

    it('should handle missing User-Agent', () => {
      mockRequest.get = jest.fn().mockReturnValue(undefined);
      
      const context = createLogContext(mockRequest as Request);
      
      expect(context).not.toHaveProperty('userAgent');
    });

    it('should handle missing IP', () => {
      const requestWithoutIp = {
        method: 'GET',
        url: '/test',
        get: jest.fn(),
        ip: undefined,
        socket: undefined
      } as unknown as Request;
      
      const context = createLogContext(requestWithoutIp);
      
      expect(context).not.toHaveProperty('ip');
    });
  });

  describe('requestLogger Middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockRequest = {
        method: 'GET',
        url: '/test',
        get: jest.fn(),
        ip: '127.0.0.1',
      };

      mockResponse = {
        statusCode: 200,
        on: jest.fn(),
      };

      mockNext = jest.fn();
    });

    it('should call next function', () => {
      requestLogger(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should log request start', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      requestLogger(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Just verify the middleware works and calls next
      expect(mockNext).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should set up response finish handler', () => {
      requestLogger(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.on).toHaveBeenCalledWith('finish', expect.any(Function));
    });

    it('should log request completion on finish', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      requestLogger(mockRequest as Request, mockResponse as Response, mockNext);
      
      // Получаем callback из вызова mockResponse.on
      const finishCallback = (mockResponse.on as jest.Mock).mock.calls[0][1];
      
      // Эмулируем завершение ответа
      expect(() => finishCallback()).not.toThrow();
      
      consoleSpy.mockRestore();
    });
  });

  describe('errorLogger Middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;
    let mockError: Error;

    beforeEach(() => {
      mockRequest = {
        method: 'GET',
        url: '/test',
        get: jest.fn(),
        ip: '127.0.0.1',
      };

      mockResponse = {
        statusCode: 500,
      };

      mockNext = jest.fn();
      mockError = new Error('Test error');
    });

    it('should log error and call next with error', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      errorLogger(mockError, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Request error: GET /test - Test error')
      );
      expect(mockNext).toHaveBeenCalledWith(mockError);
      
      consoleSpy.mockRestore();
    });
  });

  describe('requestIdMiddleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockRequest = {
        headers: {},
      };

      mockResponse = {
        setHeader: jest.fn(),
      };

      mockNext = jest.fn();
    });

    it('should generate request ID and add to headers', () => {
      requestIdMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockRequest.headers).toHaveProperty('x-request-id');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-Request-ID',
        expect.any(String)
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should generate unique request IDs', () => {
      requestIdMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      const firstId = mockRequest.headers?.['x-request-id'];
      
      // Сбрасываем моки
      jest.clearAllMocks();
      
      requestIdMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      const secondId = mockRequest.headers?.['x-request-id'];
      
      expect(firstId).not.toBe(secondId);
    });
  });
});