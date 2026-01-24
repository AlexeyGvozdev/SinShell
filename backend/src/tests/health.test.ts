import request from 'supertest';
import createApp from '../app';

describe('Health Endpoints', () => {
  let app: any;

  beforeAll(() => {
    app = createApp();
  });

  describe('GET /health', () => {
    it('should return basic health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(typeof response.body.uptime).toBe('number');
    });
  });

  describe('GET /api/v1/health', () => {
    it('should return API health check with success structure', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status', 'ok');
      expect(response.body.data).toHaveProperty('timestamp');
      expect(response.body.data).toHaveProperty('uptime');
      expect(response.body.data).toHaveProperty('version', '1.0.0');
    });
  });

  describe('GET /api/v1/health/detailed', () => {
    it('should return detailed health information', async () => {
      const response = await request(app)
        .get('/api/v1/health/detailed')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status', 'ok');
      expect(response.body.data).toHaveProperty('timestamp');
      expect(response.body.data).toHaveProperty('uptime');
      expect(response.body.data).toHaveProperty('version', '1.0.0');
      expect(response.body.data).toHaveProperty('environment');
      expect(response.body.data).toHaveProperty('memory');

      // Check memory structure
      expect(response.body.data.memory).toHaveProperty('rss');
      expect(response.body.data.memory).toHaveProperty('heapTotal');
      expect(response.body.data.memory).toHaveProperty('heapUsed');
      expect(response.body.data.memory).toHaveProperty('external');

      // Check system structure (platform, arch, nodeVersion are at root level)
      expect(response.body.data).toHaveProperty('platform');
      expect(response.body.data).toHaveProperty('arch');
      expect(response.body.data).toHaveProperty('nodeVersion');
    });
  });

  describe('GET /api/v1/health/ready', () => {
    it('should return readiness status', async () => {
      const response = await request(app)
        .get('/api/v1/health/ready')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('ready', true);
      expect(response.body.data).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/v1/health/live', () => {
    it('should return liveness status', async () => {
      const response = await request(app)
        .get('/api/v1/health/live')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('alive', true);
      expect(response.body.data).toHaveProperty('timestamp');
    });
  });

  describe('Invalid health endpoints', () => {
    it('should return 404 for non-existent health endpoint', async () => {
      await request(app)
        .get('/api/v1/health/invalid')
        .expect(404);
    });
  });
});