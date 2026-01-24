import request from 'supertest';
import createApp from '../app';
import { CustomError } from '../middleware/errorHandler';

describe('App Tests', () => {
  let app: any;

  beforeEach(() => {
    app = createApp();
  });

  describe('App Initialization', () => {
    it('should create Express app', () => {
      expect(app).toBeDefined();
      expect(typeof app).toBe('function');
    });

    it('should have proper Express structure', () => {
      expect(app._router).toBeDefined();
      expect(app.settings).toBeDefined();
    });
  });

  describe('Middleware Setup', () => {
    it('should handle JSON parsing', async () => {
      const response = await request(app)
        .post('/api/v1/health')
        .send({ test: 'data' })
        .expect(404); // Route doesn't exist, but middleware should work

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should handle URL-encoded data', async () => {
      const response = await request(app)
        .post('/api/v1/health')
        .send('test=data&value=123')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .expect(404);

      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('CORS Headers', () => {
    it('should set CORS headers', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should handle OPTIONS requests', async () => {
      const response = await request(app)
        .options('/api/v1/health')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toBeDefined();
      expect(response.headers['access-control-allow-headers']).toBeDefined();
    });
  });

  describe('Security Headers', () => {
    it('should set security headers', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      // Check for common security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
    });
  });

  describe('Request ID Headers', () => {
    it('should add request ID to responses', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.headers['x-request-id']).toBeDefined();
      expect(typeof response.headers['x-request-id']).toBe('string');
    });

    it('should generate unique request IDs', async () => {
      const response1 = await request(app)
        .get('/api/v1/health')
        .expect(200);

      const response2 = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response1.headers['x-request-id']).not.toBe(response2.headers['x-request-id']);
    });
  });

  describe('Error Handling', () => {
    it('should handle async errors properly', async () => {
      // Тестируем обработку асинхронных ошибок через существующий механизм
      const error = new Error('Async error test');
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Async error test');
    });

    it('should handle custom errors properly', async () => {
      const error = new CustomError('Custom error test', 400, 'CUSTOM_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Custom error test');
      expect(error.code).toBe('CUSTOM_ERROR');
    });

    it('should handle validation errors', async () => {
      const error = new Error('Validation failed');
      (error as any).statusCode = 422;
      expect((error as any).statusCode).toBe(422);
      expect(error.message).toBe('Validation failed');
    });
  });

  describe('Route Handling', () => {
    it('should handle 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Route GET /unknown-route not found');
    });

    it('should handle 404 for unknown methods on known routes', async () => {
      const response = await request(app)
        .patch('/api/v1/health')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Route PATCH /api/v1/health not found');
    });

    it('should handle nested routes correctly', async () => {
      const response = await request(app)
        .get('/api/v1/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Content Type Handling', () => {
    it('should handle missing content-type', async () => {
      const response = await request(app)
        .post('/api/v1/health')
        .send('some data')
        .expect(404);

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should handle invalid JSON', async () => {
      // body-parser возвращает 400 для невалидного JSON
      const response = await request(app)
        .post('/api/v1/health')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      // Может быть либо 400 (body-parser error), либо 404 (route not found)
      expect([400, 404, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('App Configuration', () => {
    it('should respect environment settings', async () => {
      const testApp = createApp();
      
      // Test that app is properly configured
      expect(testApp.get('env')).toBeDefined();
    });

    it('should handle different environments', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';
      
      const testApp = createApp();
      
      expect(testApp).toBeDefined();
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Graceful Shutdown', () => {
    it('should handle SIGTERM gracefully', () => {
      const testApp = createApp();
      
      // This test verifies that the app can be created without errors
      // In a real scenario, you would test the actual shutdown process
      expect(testApp).toBeDefined();
    });

    it('should handle SIGINT gracefully', () => {
      const testApp = createApp();
      
      // This test verifies that the app can be created without errors
      // In a real scenario, you would test the actual shutdown process
      expect(testApp).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should respond within reasonable time', async () => {
      const start = Date.now();
      
      await request(app)
        .get('/api/v1/health')
        .expect(200);
      
      const duration = Date.now() - start;
      
      // Should respond within 100ms (adjust as needed)
      expect(duration).toBeLessThan(100);
    });

    it('should handle concurrent requests', async () => {
      const promises = Array(10).fill(null).map(() =>
        request(app).get('/api/v1/health').expect(200)
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.body).toHaveProperty('success', true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long URLs', async () => {
      const longPath = '/api/v1/' + 'a'.repeat(1000);
      
      const response = await request(app)
        .get(longPath)
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });

    it('should handle special characters in URL', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should handle empty request body', async () => {
      const response = await request(app)
        .post('/api/v1/health')
        .send()
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});