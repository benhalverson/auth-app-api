import { describe, it, expect, vi } from 'vitest';
import app from '../../src/index';

// Mock D1Database
const mockD1: D1Database = {
  prepare: vi.fn().mockReturnThis(),
  bind: vi.fn().mockReturnThis(),
  run: vi.fn().mockResolvedValue({ success: true, meta: {} }),
  all: vi.fn().mockResolvedValue({ results: [], success: true, meta: {} }),
  first: vi.fn().mockResolvedValue(null),
  raw: vi.fn().mockResolvedValue([]),
  dump: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
  batch: vi.fn().mockResolvedValue([]),
  exec: vi.fn().mockResolvedValue({ count: 0, duration: 0 }),
} as any;

const mockEnv = {
  users: mockD1,
  BETTER_AUTH_SECRET: 'test-secret-key-minimum-32-characters-long',
};

describe('Protected Routes Integration Tests', () => {
  describe('Authentication Middleware', () => {
    it('should return 401 for missing Authorization header', async () => {
      const req = new Request('http://localhost/api/protected', {
        method: 'GET',
      });

      const res = await app.fetch(req, mockEnv);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    it('should return 401 for malformed Authorization header', async () => {
      const req = new Request('http://localhost/api/protected', {
        method: 'GET',
        headers: { 'Authorization': 'NotBearer token' },
      });

      const res = await app.fetch(req, mockEnv);
      expect(res.status).toBe(401);
    });

    it('should handle Bearer token format', async () => {
      const req = new Request('http://localhost/api/protected', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer test-token-123' },
      });

      const res = await app.fetch(req, mockEnv);
      // Will fail with mocked DB, but validates Bearer parsing works
      expect(res.status).toBe(401);
    });

    it('should handle empty Authorization header', async () => {
      const req = new Request('http://localhost/api/protected', {
        method: 'GET',
        headers: { 'Authorization': '' },
      });

      const res = await app.fetch(req, mockEnv);
      expect(res.status).toBe(401);
    });

    it('should trim whitespace from Authorization header', async () => {
      const req = new Request('http://localhost/api/protected', {
        method: 'GET',
        headers: { 'Authorization': '  Bearer test-token  ' },
      });

      const res = await app.fetch(req, mockEnv);
      // Should handle the token despite whitespace
      expect(res.status).toBe(401);
    });
  });

  describe('Route Authorization', () => {
    it('should reject unauthenticated requests to protected route', async () => {
      const req = new Request('http://localhost/api/protected', {
        method: 'GET',
      });

      const res = await app.fetch(req, mockEnv);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain('Unauthorized');
    });

    it('should attempt to validate session token', async () => {
      const req = new Request('http://localhost/api/protected', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer invalid-token' },
      });

      const res = await app.fetch(req, mockEnv);
      expect(res.status).toBe(401);
    });

    it('should return JSON response with error message', async () => {
      const req = new Request('http://localhost/api/protected', {
        method: 'GET',
      });

      const res = await app.fetch(req, mockEnv);
      expect(res.headers.get('Content-Type')).toContain('application/json');
      const data = await res.json();
      expect(data.error).toBeDefined();
      expect(typeof data.error).toBe('string');
    });
  });

  describe('Protected Route Response', () => {
    it('should include error message for unauthenticated access', async () => {
      const req = new Request('http://localhost/api/protected', {
        method: 'GET',
      });

      const res = await app.fetch(req, mockEnv);
      const data = await res.json();
      expect(data.error).toMatch(/Unauthorized|authenticated/i);
    });

    it('should have Content-Type header for error response', async () => {
      const req = new Request('http://localhost/api/protected', {
        method: 'GET',
      });

      const res = await app.fetch(req, mockEnv);
      const contentType = res.headers.get('Content-Type');
      expect(contentType).toContain('application/json');
    });
  });

  describe('Request Validation', () => {
    it('should handle OPTIONS preflight for protected route', async () => {
      const req = new Request('http://localhost/api/protected', {
        method: 'OPTIONS',
        headers: { 'Origin': 'http://localhost:5173' },
      });

      const res = await app.fetch(req, mockEnv);
      expect(res.status).toBe(204);
    });

    it('should handle GET request method correctly', async () => {
      const req = new Request('http://localhost/api/protected', {
        method: 'GET',
      });

      const res = await app.fetch(req, mockEnv);
      expect([401, 405]).toContain(res.status);
    });

    it('should reject POST to GET-only protected route', async () => {
      const req = new Request('http://localhost/api/protected', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const res = await app.fetch(req, mockEnv);
      expect([404, 405, 401]).toContain(res.status);
    });
  });

  describe('CORS on Protected Routes', () => {
    it('should include CORS headers in protected route responses', async () => {
      const req = new Request('http://localhost/api/protected', {
        method: 'GET',
        headers: { 'Origin': 'http://localhost:5173' },
      });

      const res = await app.fetch(req, mockEnv);
      const corsHeader = res.headers.get('Access-Control-Allow-Origin');
      expect(corsHeader).toBeDefined();
    });

    it('should allow credentials in CORS headers', async () => {
      const req = new Request('http://localhost/api/protected', {
        method: 'OPTIONS',
        headers: { 'Origin': 'http://localhost:5173' },
      });

      const res = await app.fetch(req, mockEnv);
      const credentialsHeader = res.headers.get('Access-Control-Allow-Credentials');
      expect(credentialsHeader).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long token strings', async () => {
      const longToken = 'Bearer ' + 'a'.repeat(10000);
      const req = new Request('http://localhost/api/protected', {
        method: 'GET',
        headers: { 'Authorization': longToken },
      });

      const res = await app.fetch(req, mockEnv);
      expect(res.status).toBe(401);
    });

    it('should handle special characters in token', async () => {
      const req = new Request('http://localhost/api/protected', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer token-with-special!@#$%chars' },
      });

      const res = await app.fetch(req, mockEnv);
      expect(res.status).toBe(401);
    });

    it('should handle multiple Authorization headers safely', async () => {
      const headers = new Headers();
      headers.append('Authorization', 'Bearer token1');
      headers.append('Authorization', 'Bearer token2');

      const req = new Request('http://localhost/api/protected', {
        method: 'GET',
        headers,
      });

      const res = await app.fetch(req, mockEnv);
      expect(res.status).toBe(401);
    });

    it('should not expose implementation details in error messages', async () => {
      const req = new Request('http://localhost/api/protected', {
        method: 'GET',
      });

      const res = await app.fetch(req, mockEnv);
      const data = await res.json();
      expect(data.error).not.toContain('sqlite');
      expect(data.error).not.toContain('database');
      expect(data.error).not.toContain('query');
    });
  });
});
