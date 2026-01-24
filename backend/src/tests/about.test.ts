import request from 'supertest';
import createApp from '../app';

describe('About Endpoints', () => {
  let app: any;

  beforeAll(() => {
    app = createApp();
  });

  describe('GET /api/v1/about', () => {
    it('should return basic project information', async () => {
      const response = await request(app)
        .get('/api/v1/about')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('title', 'SinShell');
      expect(response.body.data).toHaveProperty('description');
      expect(response.body.data).toHaveProperty('version', '1.0.0');
      expect(response.body.data).toHaveProperty('author');
      expect(response.body.data).toHaveProperty('links');
      expect(response.body.data).toHaveProperty('technologies');
    });
  });

  describe('GET /api/v1/about/extended', () => {
    it('should return extended project information', async () => {
      const response = await request(app)
        .get('/api/v1/about/extended')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('title', 'SinShell');
      expect(response.body.data).toHaveProperty('description');
      expect(response.body.data).toHaveProperty('version', '1.0.0');
      expect(response.body.data).toHaveProperty('author');
      expect(response.body.data).toHaveProperty('license', 'MIT');
      expect(response.body.data).toHaveProperty('repository');
      expect(response.body.data).toHaveProperty('homepage');
      expect(response.body.data).toHaveProperty('timestamp');
      
      // Extended specific fields
      expect(response.body.data).toHaveProperty('features');
      expect(response.body.data).toHaveProperty('technologies');
      expect(response.body.data).toHaveProperty('architecture');
      expect(response.body.data).toHaveProperty('links');

      // Check features array
      expect(Array.isArray(response.body.data.features)).toBe(true);
      expect(response.body.data.features.length).toBeGreaterThan(0);

      // Check technologies object
      expect(typeof response.body.data.technologies).toBe('object');
      expect(response.body.data.technologies).toHaveProperty('frontend');
      expect(response.body.data.technologies).toHaveProperty('backend');
      expect(response.body.data.technologies).toHaveProperty('devops');

      // Check specific technologies
      const frontendTech = response.body.data.technologies.frontend;
      const backendTech = response.body.data.technologies.backend;
      expect(frontendTech).toContain('Next.js 14+');
      expect(frontendTech).toContain('TypeScript');
      expect(backendTech).toContain('Express.js');
      expect(backendTech).toContain('Node.js 18+');
    });
  });

  describe('GET /api/v1/about/license', () => {
    it('should return license information', async () => {
      const response = await request(app)
        .get('/api/v1/about/license')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('name', 'MIT License');
      expect(response.body.data).toHaveProperty('type', 'MIT');
      expect(response.body.data).toHaveProperty('url');
      expect(response.body.data).toHaveProperty('description');
      expect(response.body.data).toHaveProperty('conditions');
      expect(response.body.data).toHaveProperty('limitations');
      expect(response.body.data).toHaveProperty('year');
      expect(response.body.data).toHaveProperty('holder');
      expect(response.body.data).toHaveProperty('timestamp');

      // Check arrays
      expect(Array.isArray(response.body.data.conditions)).toBe(true);
      expect(Array.isArray(response.body.data.limitations)).toBe(true);

      // Check specific license terms
      const conditions = response.body.data.conditions;
      expect(conditions.length).toBeGreaterThan(0);

      const limitations = response.body.data.limitations;
      expect(limitations.length).toBeGreaterThan(0);
    });
  });

  describe('Invalid about endpoints', () => {
    it('should return 404 for non-existent about endpoint', async () => {
      await request(app)
        .get('/api/v1/about/invalid')
        .expect(404);
    });

    it('should return 404 for about endpoint with wrong HTTP method', async () => {
      await request(app)
        .post('/api/v1/about')
        .expect(404);

      await request(app)
        .put('/api/v1/about')
        .expect(404);

      await request(app)
        .delete('/api/v1/about')
        .expect(404);
    });
  });

  describe('Response format consistency', () => {
    it('should return consistent response format across all about endpoints', async () => {
      const endpoints = [
        '/api/v1/about',
        '/api/v1/about/extended',
        '/api/v1/about/license'
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .expect(200);

        // All responses should have the same structure
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('data');
        expect(typeof response.body.data).toBe('object');
        // Basic about endpoint doesn't have timestamp in data
        if (endpoint !== '/api/v1/about') {
          expect(response.body.data).toHaveProperty('timestamp');
        }
      }
    });
  });

  describe('Data integrity', () => {
    it('should return valid timestamps in all responses', async () => {
      const endpoints = [
        '/api/v1/about',
        '/api/v1/about/extended',
        '/api/v1/about/license'
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .expect(200);

        // Basic about endpoint doesn't have timestamp in data
        if (endpoint !== '/api/v1/about') {
          const timestamp = response.body.data.timestamp;
          expect(typeof timestamp).toBe('string');
          expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
          
          // Verify it's a valid date
          const date = new Date(timestamp);
          expect(date.getTime()).not.toBeNaN();
        }
      }
    });

    it('should return consistent project information across endpoints', async () => {
      const basicResponse = await request(app)
        .get('/api/v1/about')
        .expect(200);

      const extendedResponse = await request(app)
        .get('/api/v1/about/extended')
        .expect(200);

      // Basic fields should be consistent
      expect(basicResponse.body.data.title).toBe(extendedResponse.body.data.title);
      expect(basicResponse.body.data.description).toBe(extendedResponse.body.data.description);
      expect(basicResponse.body.data.version).toBe(extendedResponse.body.data.version);
      expect(basicResponse.body.data.author).toBe(extendedResponse.body.data.author);
    });
  });

  describe('CORS headers', () => {
    it('should include CORS headers in about responses', async () => {
      const response = await request(app)
        .get('/api/v1/about')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });
});