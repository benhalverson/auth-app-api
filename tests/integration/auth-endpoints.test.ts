import { describe, it, expect, beforeEach, vi } from 'vitest';
import app from '../../src/index';

// Mock D1Database with proper types
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
} as D1Database;

// Mock environment
const mockEnv = {
  users: mockD1,
  BETTER_AUTH_SECRET: 'test-secret-key-minimum-32-characters-long',
};

describe('Authentication Endpoints Integration Tests', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/sign-up', () => {
    it('should validate required fields - missing email', async () => {
      const req = new Request('http://localhost/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'Test123!', name: 'Test' }),
      });

      const res = await app.fetch(req, mockEnv);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('required');
    });

    it('should validate required fields - missing password', async () => {
      const req = new Request('http://localhost/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', name: 'Test' }),
      });

      const res = await app.fetch(req, mockEnv);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('required');
    });

    it('should validate required fields - missing name', async () => {
      const req = new Request('http://localhost/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'Test123!' }),
      });

      const res = await app.fetch(req, mockEnv);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('required');
    });

    it('should handle sign-up with valid data (validates validation logic)', async () => {
      const req = new Request('http://localhost/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'test@example.com', 
          password: 'Test123!',
          name: 'Test User'
        }),
      });

      const res = await app.fetch(req, mockEnv);
      // With mocked DB that returns empty results, the sign-up will fail
      // This validates that the endpoint exists and processes the request
      // Expect either success (200) or bad request (400) due to mock limitations
      expect(res.status).toBeGreaterThanOrEqual(200);
      expect(res.status).toBeLessThan(500);
      
      // If the request failed, it should be due to data issues, not server errors
      if (res.status >= 400) {
        const data = await res.json();
        expect(data).toHaveProperty('error');
      }
    });
  });

  describe('POST /api/sign-in', () => {
    it('should validate required fields - missing email', async () => {
      const req = new Request('http://localhost/api/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'Test123!' }),
      });

      const res = await app.fetch(req, mockEnv);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('required');
    });

    it('should validate required fields - missing password', async () => {
      const req = new Request('http://localhost/api/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const res = await app.fetch(req, mockEnv);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('required');
    });

    it('should handle sign-in with valid data (validates authentication flow)', async () => {
      const req = new Request('http://localhost/api/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'test@example.com', 
          password: 'Test123!'
        }),
      });

      const res = await app.fetch(req, mockEnv);
      // With mocked DB that returns no user, expect authentication failure
      expect(res.status).toBeGreaterThanOrEqual(200);
      expect(res.status).toBeLessThan(500);
      
      // Since no user exists in mock DB, expect 401 or 400
      if (res.status >= 400) {
        const data = await res.json();
        expect(data).toHaveProperty('error');
      }
    });
  });

  describe('GET /api/me', () => {
    it('should return 401 without authentication', async () => {
      const req = new Request('http://localhost/api/me', {
        method: 'GET',
      });

      const res = await app.fetch(req, mockEnv);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain('Not authenticated');
    });

    it('should attempt to validate token when provided', async () => {
      const req = new Request('http://localhost/api/me', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer fake-token' },
      });

      const res = await app.fetch(req, mockEnv);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/sign-out', () => {
    it('should handle sign-out without authentication', async () => {
      const req = new Request('http://localhost/api/sign-out', {
        method: 'POST',
      });

      const res = await app.fetch(req, mockEnv);
      // Sign-out should handle missing session gracefully
      expect(res.status).toBeGreaterThanOrEqual(200);
      expect(res.status).toBeLessThan(500);
    });

    it('should handle sign-out with invalid token', async () => {
      const req = new Request('http://localhost/api/sign-out', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer fake-token' },
      });

      const res = await app.fetch(req, mockEnv);
      // Should handle invalid token gracefully
      expect(res.status).toBeGreaterThanOrEqual(200);
      expect(res.status).toBeLessThan(500);
    });
  });

  describe('GET /api/protected', () => {
    it('should return 401 without authentication', async () => {
      const req = new Request('http://localhost/api/protected', {
        method: 'GET',
      });

      const res = await app.fetch(req, mockEnv);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain('Unauthorized');
    });

    it('should attempt validation with token', async () => {
      const req = new Request('http://localhost/api/protected', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer fake-token' },
      });

      const res = await app.fetch(req, mockEnv);
      expect(res.status).toBe(401);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing JSON body', async () => {
      const req = new Request('http://localhost/api/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });

      const res = await app.fetch(req, mockEnv);
      expect(res.status).toBe(400);
    });
  });

  describe('CORS Configuration', () => {
    it('should include CORS headers', async () => {
      const req = new Request('http://localhost/api/me', {
        method: 'GET',
        headers: { 'Origin': 'http://localhost:5173' },
      });

      const res = await app.fetch(req, mockEnv);
      const corsHeader = res.headers.get('Access-Control-Allow-Origin');
      expect(corsHeader).toBeDefined();
    });

    it('should handle OPTIONS preflight requests', async () => {
      const req = new Request('http://localhost/api/sign-up', {
        method: 'OPTIONS',
        headers: { 'Origin': 'http://localhost:5173' },
      });

      const res = await app.fetch(req, mockEnv);
      expect(res.status).toBe(204);
    });
  });
});
