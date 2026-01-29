import { describe, it, expect, vi } from 'vitest';
import { createAuth } from '../../lib/auth';

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

describe('Session Management Integration Tests', () => {
  describe('Session API', () => {
    it('should expose getSession method', () => {
      const auth = createAuth(mockD1);
      expect(auth.api.getSession).toBeDefined();
      expect(typeof auth.api.getSession).toBe('function');
    });

    it('should return null session when no headers provided', async () => {
      const auth = createAuth(mockD1);
      const result = await auth.api.getSession({ headers: new Headers() });
      // With mocked DB returning null, session should be null
      expect(result).toBeNull();
    });

    it('should attempt to validate session with authorization header', async () => {
      const auth = createAuth(mockD1);
      const headers = new Headers({ 'Authorization': 'Bearer test-token' });
      const result = await auth.api.getSession({ headers });
      // With mocked DB, token validation will fail and return null
      expect(result).toBeNull();
    });

    it('should handle invalid authorization format', async () => {
      const auth = createAuth(mockD1);
      const headers = new Headers({ 'Authorization': 'InvalidFormat' });
      const result = await auth.api.getSession({ headers });
      expect(result).toBeNull();
    });
  });

  describe('Session Methods', () => {
    it('should expose listSessions method', () => {
      const auth = createAuth(mockD1);
      expect(auth.api.listSessions).toBeDefined();
      expect(typeof auth.api.listSessions).toBe('function');
    });

    it('should expose revokeSession method', () => {
      const auth = createAuth(mockD1);
      expect(auth.api.revokeSession).toBeDefined();
      expect(typeof auth.api.revokeSession).toBe('function');
    });

    it('should expose revokeOtherSessions method', () => {
      const auth = createAuth(mockD1);
      expect(auth.api.revokeOtherSessions).toBeDefined();
      expect(typeof auth.api.revokeOtherSessions).toBe('function');
    });

    it('should handle listSessions requiring authentication', async () => {
      const auth = createAuth(mockD1);
      // Without a valid session, listSessions should require auth
      await expect(auth.api.listSessions({ headers: new Headers() })).rejects.toThrow();
    });

    it('should handle revoke session with proper parameters', async () => {
      const auth = createAuth(mockD1);
      // Test that revokeSession validates required fields
      await expect(
        auth.api.revokeSession({ 
          headers: new Headers(),
          body: { token: 'fake-session-token' }
        })
      ).rejects.toThrow();
    });
  });
});
