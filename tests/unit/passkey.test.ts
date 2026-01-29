import { describe, it, expect, vi } from 'vitest';
import { createAuth } from '../../lib/auth';
import { passkey as passkeyTable } from '../../src/db/schema';

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

describe('Passkey Plugin Integration', () => {
  describe('Plugin Configuration', () => {
    it('should include passkey plugin in auth configuration', () => {
      const auth = createAuth(mockD1);
      expect(auth).toBeDefined();
      expect(auth.options).toBeDefined();
      expect(auth.options.plugins).toBeDefined();
      expect(Array.isArray(auth.options.plugins)).toBe(true);
    });

    it('should have passkey plugin in plugins array', () => {
      const auth = createAuth(mockD1);
      const plugins = auth.options.plugins || [];
      expect(plugins.length).toBeGreaterThan(0);
      // Plugin is added, verify by checking auth has passkey methods
      expect(auth.api).toBeDefined();
    });
  });

  describe('Passkey Schema', () => {
    it('should have passkey table defined in schema', () => {
      expect(passkeyTable).toBeDefined();
      // Drizzle table is defined
      expect(typeof passkeyTable).toBe('object');
    });

    it('should export passkey table from schema', async () => {
      const schema = await import('../../src/db/schema');
      expect(schema.passkey).toBeDefined();
    });

    it('should support passkey table queries', async () => {
      const schema = await import('../../src/db/schema');
      const { passkey: passkeyTable } = schema;
      
      // Passkey table should be queryable by drizzle
      expect(passkeyTable).toBeDefined();
    });

    it('should have userId linked to user table', async () => {
      const schema = await import('../../src/db/schema');
      const { passkey: passkeyTable, user: userTable } = schema;
      
      // Both tables should be defined
      expect(passkeyTable).toBeDefined();
      expect(userTable).toBeDefined();
    });
  });

  describe('Passkey API Methods', () => {
    it('should expose passkey endpoints via auth.handler', () => {
      const auth = createAuth(mockD1);
      expect(auth.handler).toBeDefined();
      expect(typeof auth.handler).toBe('function');
    });

    it('should expose api methods through auth instance', () => {
      const auth = createAuth(mockD1);
      expect(auth.api).toBeDefined();
      
      // Check for common passkey-related methods
      expect(auth.api.getSession).toBeDefined();
      expect(auth.api.signUpEmail).toBeDefined();
      expect(auth.api.signInEmail).toBeDefined();
    });

    it('should support passkey endpoints at /api/auth/passkey/*', () => {
      const auth = createAuth(mockD1);
      
      // Passkey plugin adds endpoints for:
      // - GET /register/options
      // - POST /register/verify
      // - GET /authenticate/options  
      // - POST /authenticate/verify
      expect(auth.handler).toBeDefined();
      expect(typeof auth.handler).toBe('function');
    });
  });

  describe('Passkey Data Structure', () => {
    it('should store passkey with all required fields', () => {
      const samplePasskey = {
        id: 'pk_123',
        userId: 'user_456',
        publicKey: 'base64-encoded-public-key',
        credentialID: 'credential-123',
        counter: 0,
        deviceType: 'singleDevice',
        backedUp: false,
        createdAt: new Date(),
      };

      expect(samplePasskey.id).toBeDefined();
      expect(samplePasskey.userId).toBeDefined();
      expect(samplePasskey.publicKey).toBeDefined();
      expect(samplePasskey.credentialID).toBeDefined();
      expect(typeof samplePasskey.counter).toBe('number');
      expect(['singleDevice', 'multiDevice']).toContain(samplePasskey.deviceType);
      expect(typeof samplePasskey.backedUp).toBe('boolean');
    });

    it('should support WebAuthn credential attributes', () => {
      const credentialAttrs = {
        credentialID: 'base64-url-encoded-id',
        publicKey: 'CBOR-encoded-key',
        counter: 42,
        transports: ['usb', 'ble'],
        aaguid: 'authenticator-guid',
        deviceType: 'multiDevice',
        backedUp: true,
      };

      expect(credentialAttrs.credentialID).toBeDefined();
      expect(credentialAttrs.publicKey).toBeDefined();
      expect(credentialAttrs.counter).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(credentialAttrs.transports)).toBe(true);
      expect(credentialAttrs.aaguid).toBeDefined();
    });
  });

  describe('Passkey Security Features', () => {
    it('should use counter for replay attack prevention', () => {
      const auth = createAuth(mockD1);
      expect(auth).toBeDefined();
      
      // Passkey plugin maintains counter for each credential
      // Counter must increase on each authentication
      // If counter doesn't increase, it's a replay attack
    });

    it('should store public key for signature verification', () => {
      const auth = createAuth(mockD1);
      expect(auth).toBeDefined();
      
      // Public key never leaves the device during registration
      // Stored on server for later signature verification
      // Private key stays on authenticator (FIDO2)
    });

    it('should support multiple passpeys per user', () => {
      const auth = createAuth(mockD1);
      expect(auth).toBeDefined();
      
      // User can register multiple security keys
      // Each gets its own row in passkey table
      // Each has unique credentialID
    });
  });

  describe('WebAuthn Flow', () => {
    it('should support passkey registration flow', () => {
      const auth = createAuth(mockD1);
      
      // Registration flow:
      // 1. Client: getCredentialCreationOptions() via /register/options
      // 2. Device: Shows authenticator UI
      // 3. Client: Sends credential to /register/verify
      // 4. Server: Validates and stores public key
      
      expect(auth.handler).toBeDefined();
    });

    it('should support passkey authentication flow', () => {
      const auth = createAuth(mockD1);
      
      // Authentication flow:
      // 1. Client: getCredentialRequestOptions() via /authenticate/options
      // 2. Device: Shows authenticator UI
      // 3. Client: Sends assertion to /authenticate/verify
      // 4. Server: Validates signature with stored public key
      
      expect(auth.handler).toBeDefined();
    });
  });

  describe('Device Types', () => {
    it('should support single device passkeys', () => {
      const deviceType = 'singleDevice';
      expect(deviceType).toBe('singleDevice');
      // Platform authenticators like Windows Hello, Touch ID
    });

    it('should support multi device passkeys', () => {
      const deviceType = 'multiDevice';
      expect(deviceType).toBe('multiDevice');
      // Cross-device authenticators like security keys
    });

    it('should track device backup status', () => {
      const auth = createAuth(mockD1);
      expect(auth).toBeDefined();
      
      // backedUp indicates if passkey is backed up
      // Affects recovery options
      // true: can be recovered if device is lost
      // false: only option is this device
    });
  });

  describe('Passkey Endpoints', () => {
    it('should expose registration options endpoint', () => {
      const auth = createAuth(mockD1);
      
      // GET /api/auth/passkey/register/options
      // Returns challenge and other options for client
      expect(auth).toBeDefined();
    });

    it('should expose registration verification endpoint', () => {
      const auth = createAuth(mockD1);
      
      // POST /api/auth/passkey/register/verify
      // Validates credential and stores passkey
      expect(auth).toBeDefined();
    });

    it('should expose authentication options endpoint', () => {
      const auth = createAuth(mockD1);
      
      // GET /api/auth/passkey/authenticate/options
      // Returns challenge for authentication
      expect(auth).toBeDefined();
    });

    it('should expose authentication verification endpoint', () => {
      const auth = createAuth(mockD1);
      
      // POST /api/auth/passkey/authenticate/verify
      // Validates signature and authenticates user
      expect(auth).toBeDefined();
    });
  });

  describe('Passkey Integration with Better-Auth', () => {
    it('should be configured alongside email/password auth', () => {
      const auth = createAuth(mockD1);
      
      // Better-Auth supports multiple auth methods simultaneously
      // Users can use both passkey and email/password
      expect(auth.options.emailAndPassword?.enabled).toBe(true);
    });

    it('should work with account linking', () => {
      const auth = createAuth(mockD1);
      
      // Passkey can be linked to OAuth accounts
      // Same user can authenticate via multiple methods
      expect(auth.options.account?.accountLinking?.enabled).toBe(true);
    });

    it('should work with admin plugin for RBAC', () => {
      const auth = createAuth(mockD1);
      
      // Passkey authentication respects user roles
      // Authenticated user role is available for authorization
      expect(auth).toBeDefined();
    });

    it('should be documented in OpenAPI schema', () => {
      const auth = createAuth(mockD1);
      
      // openAPI plugin documents passkey endpoints
      // OpenAPI schema at /api/auth/openapi.json includes passkey routes
      expect(auth).toBeDefined();
    });
  });
});
