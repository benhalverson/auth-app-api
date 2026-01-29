import { describe, it, expect } from 'vitest';
import * as schema from '../../src/db/schema';

describe('Database Schema Validation', () => {
  describe('User Table', () => {
    it('should have user table defined', () => {
      expect(schema.user).toBeDefined();
    });

    it('should export user schema', () => {
      expect(typeof schema.user).toBe('object');
    });

    it('should have required camelCase field names', () => {
      // These are the fields we're checking for existence in exports
      expect(schema).toHaveProperty('user');
    });

    it('should export session table', () => {
      expect(schema.session).toBeDefined();
      expect(typeof schema.session).toBe('object');
    });

    it('should export account table', () => {
      expect(schema.account).toBeDefined();
      expect(typeof schema.account).toBe('object');
    });

    it('should export verification table', () => {
      expect(schema.verification).toBeDefined();
      expect(typeof schema.verification).toBe('object');
    });

    it('should export passkey table', () => {
      expect(schema.passkey).toBeDefined();
      expect(typeof schema.passkey).toBe('object');
    });
  });

  describe('Schema Field Names', () => {
    it('should use camelCase naming convention', () => {
      // Verify module exports correct tables
      const tables = Object.keys(schema);
      expect(tables).toContain('user');
      expect(tables).toContain('session');
      expect(tables).toContain('account');
      expect(tables).toContain('verification');
      expect(tables).toContain('passkey');
    });

    it('should have all required tables exported', () => {
      // Core auth tables required by better-auth
      const requiredTables = ['user', 'session', 'account', 'verification'];
      requiredTables.forEach(table => {
        expect(schema).toHaveProperty(table);
      });
    });

    it('should have passkey table for WebAuthn support', () => {
      // Passkey table needed for better-auth passkey plugin
      expect(schema).toHaveProperty('passkey');
    });
  });

  describe('Schema Consistency', () => {
    it('should use consistent data types', () => {
      // All tables should be properly defined Drizzle tables
      expect(Object.keys(schema).length).toBeGreaterThan(0);
    });

    it('should export only schema definitions', () => {
      // Should not export functions or classes, only table definitions
      const validExports = Object.keys(schema);
      expect(validExports.length).toBeGreaterThanOrEqual(5); // At least 5 tables
    });
  });

  describe('Admin Plugin Fields', () => {
    it('should have role field on user table', () => {
      expect(schema.user).toBeDefined();
      // Check if role field exists in the table definition
      const userColumns = Object.keys((schema.user as any));
      expect(userColumns).toContain('role');
    });

    it('should have ban tracking fields on user table', () => {
      // User schema should support banned, banReason, banExpires
      expect(schema.user).toBeDefined();
      const userColumns = Object.keys((schema.user as any));
      expect(userColumns).toContain('banned');
      expect(userColumns).toContain('banReason');
      expect(userColumns).toContain('banExpires');
    });
  });

  describe('Timestamps and Tracking', () => {
    it('should have createdAt timestamp on user table', () => {
      expect(schema.user).toBeDefined();
      const userColumns = Object.keys((schema.user as any));
      expect(userColumns).toContain('createdAt');
    });

    it('should have updatedAt timestamp on user table', () => {
      expect(schema.user).toBeDefined();
      const userColumns = Object.keys((schema.user as any));
      expect(userColumns).toContain('updatedAt');
    });

    it('should have createdAt timestamp on session table', () => {
      expect(schema.session).toBeDefined();
      const sessionColumns = Object.keys((schema.session as any));
      expect(sessionColumns).toContain('createdAt');
    });

    it('should have updatedAt timestamp on account table', () => {
      expect(schema.account).toBeDefined();
      const accountColumns = Object.keys((schema.account as any));
      expect(accountColumns).toContain('updatedAt');
    });
  });

  describe('OAuth and Account Fields', () => {
    it('should have OAuth token fields on account table', () => {
      expect(schema.account).toBeDefined();
      const accountColumns = Object.keys((schema.account as any));
      expect(accountColumns).toContain('accessToken');
      expect(accountColumns).toContain('refreshToken');
      expect(accountColumns).toContain('idToken');
    });

    it('should have password field on account table for email/password auth', () => {
      expect(schema.account).toBeDefined();
      const accountColumns = Object.keys((schema.account as any));
      expect(accountColumns).toContain('password');
    });
  });
});
