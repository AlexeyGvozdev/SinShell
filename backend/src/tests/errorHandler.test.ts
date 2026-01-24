import request from 'supertest';
import createApp from '../app';
import { 
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
  InternalServerError,
  isCustomError
} from '../middleware/errorHandler';

describe('Error Handler Tests', () => {
  let app: any;

  beforeAll(() => {
    app = createApp();
  });

  describe('Custom Error Functions', () => {
    it('should create BadRequestError with correct properties', () => {
      const error = BadRequestError('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
      expect(error.name).toBe('CustomError');
      expect(error.code).toBe('BAD_REQUEST');
      expect(isCustomError(error)).toBe(true);
    });

    it('should create UnauthorizedError with correct properties', () => {
      const error = UnauthorizedError('Unauthorized access');
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Unauthorized access');
      expect(error.name).toBe('CustomError');
      expect(error.code).toBe('UNAUTHORIZED');
      expect(isCustomError(error)).toBe(true);
    });

    it('should create ForbiddenError with correct properties', () => {
      const error = ForbiddenError('Access denied');
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Access denied');
      expect(error.name).toBe('CustomError');
      expect(error.code).toBe('FORBIDDEN');
      expect(isCustomError(error)).toBe(true);
    });

    it('should create NotFoundError with correct properties', () => {
      const error = NotFoundError('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
      expect(error.name).toBe('CustomError');
      expect(error.code).toBe('NOT_FOUND');
      expect(isCustomError(error)).toBe(true);
    });

    it('should create ConflictError with correct properties', () => {
      const error = ConflictError('Resource conflict');
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('Resource conflict');
      expect(error.name).toBe('CustomError');
      expect(error.code).toBe('CONFLICT');
      expect(isCustomError(error)).toBe(true);
    });

    it('should create ValidationError with correct properties', () => {
      const error = ValidationError('Validation failed');
      expect(error.statusCode).toBe(422);
      expect(error.message).toBe('Validation failed');
      expect(error.name).toBe('CustomError');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(isCustomError(error)).toBe(true);
    });

    it('should create RateLimitError with correct properties', () => {
      const error = RateLimitError('Rate limit exceeded');
      expect(error.statusCode).toBe(429);
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.name).toBe('CustomError');
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(isCustomError(error)).toBe(true);
    });

    it('should create InternalServerError with correct properties', () => {
      const error = InternalServerError('Internal server error');
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Internal server error');
      expect(error.name).toBe('CustomError');
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(isCustomError(error)).toBe(true);
    });

    it('should identify non-custom errors correctly', () => {
      const error = new Error('Regular error');
      expect(isCustomError(error)).toBe(false);
    });

    it('should handle custom errors with default messages', () => {
      const unauthorizedError = UnauthorizedError();
      expect(unauthorizedError.message).toBe('Unauthorized');

      const forbiddenError = ForbiddenError();
      expect(forbiddenError.message).toBe('Forbidden');

      const notFoundError = NotFoundError();
      expect(notFoundError.message).toBe('Resource not found');

      const rateLimitError = RateLimitError();
      expect(rateLimitError.message).toBe('Too many requests');

      const internalError = InternalServerError();
      expect(internalError.message).toBe('Internal server error');
    });

    it('should handle errors with details', () => {
      const details = { field: 'email', value: 'invalid' };
      const validationError = ValidationError('Invalid email', details);
      expect(validationError.details).toEqual(details);
    });
  });

  describe('Error Response Format', () => {
    it('should return proper error response format for 404', async () => {
      const response = await request(app)
        .get('/non-existent-endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Route GET /non-existent-endpoint not found');
    });

    it('should return proper error response format for method not allowed', async () => {
      const response = await request(app)
        .post('/api/v1/health')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Route POST /api/v1/health not found');
    });

    it('should not expose stack traces in production mode', async () => {
      const response = await request(app)
        .get('/non-existent-endpoint')
        .expect(404);

      expect(response.body).not.toHaveProperty('stack');
    });
  });

  describe('Error Handler Edge Cases', () => {
    it('should handle errors without message', () => {
      const error = new Error();
      expect(error.message).toBe('');
      
      // Проверяем, что обработчик ошибок может работать с пустым сообщением
      const errorWithoutMessage = InternalServerError();
      expect(errorWithoutMessage.message).toBe('Internal server error');
    });

    it('should handle errors with null message', () => {
      const error = new Error(null as any);
      expect(error.message).toBe('null');
      
      // Проверяем, что кастомные ошибки всегда имеют сообщение
      const customError = InternalServerError(null as any);
      expect(customError.message).toBeTruthy();
    });
  });
});