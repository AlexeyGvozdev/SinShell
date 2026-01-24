import request from 'supertest';
import createApp from '../app';

describe('Integration Tests', () => {
  let app: any;

  beforeAll(() => {
    app = createApp();
  });

  describe('API Endpoints Integration', () => {
    it('should handle multiple requests concurrently', async () => {
      const requests = [
        request(app).get('/health'),
        request(app).get('/api/v1/health'),
        request(app).get('/api/v1/info'),
        request(app).get('/api/v1/about')
      ];

      const responses = await Promise.all(requests);

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Check response structures
      expect(responses[0]?.body).toHaveProperty('status', 'ok');
      expect(responses[1]?.body).toHaveProperty('success', true);
      expect(responses[2]?.body).toHaveProperty('success', true);
      expect(responses[3]?.body).toHaveProperty('success', true);
    });

    it('should maintain consistent API versioning', async () => {
      const endpoints = [
        '/api/v1/health',
        '/api/v1/info',
        '/api/v1/about'
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
      }
    });

    it('should handle invalid endpoints consistently', async () => {
      const invalidEndpoints = [
        '/invalid',
        '/api/invalid',
        '/api/v1/invalid',
        '/api/v2/health',
        '/health/invalid'
      ];

      for (const endpoint of invalidEndpoints) {
        await request(app)
          .get(endpoint)
          .expect(404);
      }
    });

    it('should handle unsupported HTTP methods consistently', async () => {
      const validEndpoints = [
        '/health',
        '/api/v1/health',
        '/api/v1/info',
        '/api/v1/about'
      ];

      const unsupportedMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];

      for (const endpoint of validEndpoints) {
        for (const method of unsupportedMethods) {
          const req = request(app);
          switch (method) {
            case 'POST':
              await req.post(endpoint).expect(404);
              break;
            case 'PUT':
              await req.put(endpoint).expect(404);
              break;
            case 'DELETE':
              await req.delete(endpoint).expect(404);
              break;
            case 'PATCH':
              await req.patch(endpoint).expect(404);
              break;
          }
        }
      }
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle malformed requests gracefully', async () => {
      // Test with invalid JSON (though our endpoints don't accept POST)
      await request(app)
        .post('/api/v1/info')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(500); // JSON parsing error returns 500
    });

    it('should handle large requests appropriately', async () => {
      // Test with very long query parameters
      const longString = 'a'.repeat(10000);
      
      await request(app)
        .get(`/api/v1/info?test=${longString}`)
        .expect(200);
    });
  });

  describe('Performance Integration', () => {
    it('should respond within reasonable time limits', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/v1/health/detailed')
        .expect(200);
      
      const responseTime = Date.now() - startTime;
      
      // Should respond within 1 second
      expect(responseTime).toBeLessThan(1000);
    });

    it('should handle multiple sequential requests', async () => {
      const requestCount = 10;
      
      for (let i = 0; i < requestCount; i++) {
        const response = await request(app)
          .get('/api/v1/health')
          .expect(200);
          
        expect(response.body).toHaveProperty('success', true);
      }
    });
  });

  describe('CORS Integration', () => {
    it('should include CORS headers on all API endpoints', async () => {
      const endpoints = [
        '/api/v1/health',
        '/api/v1/info',
        '/api/v1/about'
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .expect(200);

        expect(response.headers).toHaveProperty('access-control-allow-origin');
      }
    });

    it('should handle OPTIONS requests for CORS preflight', async () => {
      const response = await request(app)
        .options('/api/v1/info')
        .expect(204); // CORS preflight returns 204 No Content
    });
  });

  describe('Security Integration', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/api/v1/info')
        .expect(200);

      // Helmet should add security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });

    it('should not expose sensitive information in error responses', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404);

      // Error response should not contain stack traces but may contain error message
      expect(response.body).not.toHaveProperty('stack');
      // Error message is acceptable for 404 responses
    });
  });

  describe('Data Consistency Integration', () => {
    it('should return consistent timestamps across related endpoints', async () => {
      const healthResponse = await request(app)
        .get('/api/v1/health');
      
      expect(healthResponse.status).toBe(200);
      expect(healthResponse.body.data.timestamp).toBeDefined();

      const infoResponse = await request(app)
        .get('/api/v1/info');
      
      expect(infoResponse.status).toBe(200);
      expect(infoResponse.body.data.timestamp).toBeDefined();

      const aboutResponse = await request(app)
        .get('/api/v1/about');
      
      expect(aboutResponse.status).toBe(200);

      // Timestamps should be valid ISO strings
      const healthTimestamp = new Date(healthResponse.body.data.timestamp);
      const infoTimestamp = new Date(infoResponse.body.data.timestamp);

      expect(healthTimestamp.getTime()).not.toBeNaN();
      expect(infoTimestamp.getTime()).not.toBeNaN();
    });

    it('should return consistent version information', async () => {
      const healthResponse = await request(app)
        .get('/api/v1/health')
        .expect(200);

      const infoResponse = await request(app)
        .get('/api/v1/info')
        .expect(200);

      const aboutResponse = await request(app)
        .get('/api/v1/about')
        .expect(200);

      // All should have the same version
      expect(healthResponse.body.data.version).toBe('1.0.0');
      expect(infoResponse.body.data.version).toBe('1.0.0');
      expect(aboutResponse.body.data.version).toBe('1.0.0');
    });
  });
});