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

describe('Session Management Integration Tests', () => {
  describe('Session API', () => {
    it('should expose getSession method', () => {
      const auth = createAuth(mockD1);
      expect(auth.api.getSession).toBeDefined();
      expect(typeof auth.api.getSession).toBe('function');
    });

    it('should handle getSession with no headers', async () => {
      const auth = createAuth(mockD1);
      const result = await auth.api.getSession({ headers: new Headers() });
      expect(result).toBeDefined();
    });

    it('should handle getSession with authorization header', async () => {
      const auth = createAuth(mockD1);
      const headers = new Headers({ 'Authorization': 'Bearer test-token' });
      const result = await auth.api.getSession({ headers });
      expect(result).toBeDefined();
    });
  });

  describe('Session Methods', () => {
    it('should expose listSessions method', () => {
      const auth = createAuth(mockD1);
      expect(auth.api.listSessions).toBeDefined();
    });

    it('should expose revokeSession method', () => {
      const auth = createAuth(mockD1);
      expect(auth.api.revokeSession).toBeDefined();
    });

    it('should expose revokeOtherSessions method', () => {
      const auth = createAuth(mockD1);
      expect(auth.api.revokeOtherSessions).toBeDefined();
    });
  });
});
