import { describe, it, expect, vi } from 'vitest';
import { createAuth } from '../../lib/auth';

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

describe('Auth Configuration', () => {
  describe('Auth Instance Creation', () => {
    it('should create auth instance with D1 database', () => {
      const auth = createAuth(mockD1);
      expect(auth).toBeDefined();
      expect(auth.api).toBeDefined();
      expect(auth.handler).toBeDefined();
    });

    it('should expose API methods', () => {
      const auth = createAuth(mockD1);
      expect(auth.api.signUpEmail).toBeDefined();
      expect(auth.api.signInEmail).toBeDefined();
      expect(auth.api.signOut).toBeDefined();
      expect(auth.api.getSession).toBeDefined();
    });

    it('should expose handler for native auth routes', () => {
      const auth = createAuth(mockD1);
      expect(typeof auth.handler).toBe('function');
    });
  });

  describe('Configuration', () => {
    it('should be importable from lib/auth.ts', async () => {
      const { createAuth } = await import('../../lib/auth');
      expect(createAuth).toBeDefined();
      expect(typeof createAuth).toBe('function');
    });

    it('should return auth instance with correct structure', () => {
      const auth = createAuth(mockD1);
      expect(auth).toHaveProperty('api');
      expect(auth).toHaveProperty('handler');
      expect(auth).toHaveProperty('options');
    });
  });
});
