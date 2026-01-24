import request from 'supertest';
import createApp from '../app';

describe('Info Endpoints', () => {
  let app: any;

  beforeAll(() => {
    app = createApp();
  });

  describe('GET /api/v1/info', () => {
    it('should return system information', async () => {
      const response = await request(app)
        .get('/api/v1/info')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('name', 'SinShell API');
      expect(response.body.data).toHaveProperty('version', '1.0.0');
      expect(response.body.data).toHaveProperty('environment');
      expect(response.body.data).toHaveProperty('nodeVersion');
      expect(response.body.data).toHaveProperty('uptime');
      expect(response.body.data).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/v1/info/api', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/api/v1/info/api')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('name', 'SinShell API');
      expect(response.body.data).toHaveProperty('version', '1.0.0');
      expect(response.body.data).toHaveProperty('apiVersion', 'v1');
      expect(response.body.data).toHaveProperty('endpoints');
      expect(typeof response.body.data.endpoints).toBe('object');

      // Check if endpoints contain expected routes
      const endpoints = response.body.data.endpoints;
      expect(endpoints).toHaveProperty('health');
      expect(endpoints).toHaveProperty('info');
      expect(endpoints).toHaveProperty('about');
      expect(endpoints.health).toBe('/api/v1/health');
      expect(endpoints.info).toBe('/api/v1/info');
      expect(endpoints.about).toBe('/api/v1/about');
    });
  });

  describe('GET /api/v1/info/server', () => {
    it('should return server status information', async () => {
      const response = await request(app)
        .get('/api/v1/info/server')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status', 'running');
      expect(response.body.data).toHaveProperty('uptime');
      expect(response.body.data).toHaveProperty('timestamp');
      expect(response.body.data).toHaveProperty('environment');
      expect(response.body.data).toHaveProperty('memory');
      expect(response.body.data).toHaveProperty('process');

      // Check memory structure
      expect(response.body.data.memory).toHaveProperty('rss');
      expect(response.body.data.memory).toHaveProperty('heapTotal');
      expect(response.body.data.memory).toHaveProperty('heapUsed');
      expect(response.body.data.memory).toHaveProperty('external');

      // Check process structure
      expect(response.body.data.process).toHaveProperty('platform');
      expect(response.body.data.process).toHaveProperty('arch');
      expect(response.body.data.process).toHaveProperty('version');
      expect(response.body.data.process).toHaveProperty('pid');
    });
  });

  describe('Invalid info endpoints', () => {
    it('should return 404 for non-existent info endpoint', async () => {
      await request(app)
        .get('/api/v1/info/invalid')
        .expect(404);
    });

    it('should return 404 for info endpoint with wrong HTTP method', async () => {
      await request(app)
        .post('/api/v1/info')
        .expect(404);

      await request(app)
        .put('/api/v1/info')
        .expect(404);

      await request(app)
        .delete('/api/v1/info')
        .expect(404);
    });
  });

  describe('CORS headers', () => {
    it('should include CORS headers in info responses', async () => {
      const response = await request(app)
        .get('/api/v1/info')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Response format consistency', () => {
    it('should return consistent response format across all info endpoints', async () => {
      const endpoints = [
        '/api/v1/info',
        '/api/v1/info/api',
        '/api/v1/info/server'
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .expect(200);

        // All responses should have the same structure
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(typeof response.body.data).toBe('object');
      }
    });
  });
});