import { Hono } from 'hono';

/**
 * Test fixtures and utilities for auth testing
 */

export const testUser = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  name: 'Test User',
};

export const testUserAdmin = {
  email: 'admin@example.com',
  password: 'AdminPassword123!',
  name: 'Admin User',
};

export const testUserBanned = {
  email: 'banned@example.com',
  password: 'BannedPassword123!',
  name: 'Banned User',
};

/**
 * Valid email formats for testing
 */
export const validEmails = [
  'user@example.com',
  'test.email@domain.co.uk',
  'name+tag@example.org',
];

/**
 * Invalid email formats for testing
 */
export const invalidEmails = [
  'notanemail',
  'missing@domain',
  '@nodomain.com',
  'spaces in@email.com',
  '',
];

/**
 * Valid password formats
 */
export const validPasswords = [
  'SecurePass123!',
  'MyPassword@2025',
  'StrongP@ss999',
];

/**
 * Invalid password formats
 */
export const invalidPasswords = [
  '123', // too short
  'nospecialchar123', // no special chars
  'NOLOWERCASE123!', // no lowercase
  'nouppercase123!', // no uppercase
  'nodigits!', // no digits
  '', // empty
];

/**
 * Mock request headers for testing
 */
export const mockHeaders = {
  validBearerToken: (token: string) => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }),
  noBearerToken: () => ({
    'Content-Type': 'application/json',
  }),
  invalidBearerToken: () => ({
    Authorization: 'Bearer invalid_token_format',
    'Content-Type': 'application/json',
  }),
  malformedAuth: () => ({
    Authorization: 'NotBearer sometoken',
    'Content-Type': 'application/json',
  }),
};

/**
 * Mock environment for D1 database
 */
export const mockEnv = {
  users: null as any, // Will be replaced with real D1 in integration tests
  BETTER_AUTH_SECRET: 'test-secret-key-must-be-32-chars-minimum-for-testing',
};

/**
 * Helper to make HTTP requests in tests
 */
export async function makeRequest(
  app: any,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  options?: {
    headers?: Record<string, string>;
    body?: any;
  }
) {
  const body = options?.body ? JSON.stringify(options.body) : undefined;
  
  return app.request(
    new Request(`http://localhost:8787${path}`, {
      method,
      headers: {
        ...options?.headers,
      },
      ...(body && { body }),
    })
  );
}

/**
 * Helper to parse response
 */
export async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type');
  
  if (contentType?.includes('application/json')) {
    return {
      status: response.status,
      data: await response.json(),
      headers: Object.fromEntries(response.headers),
    };
  }
  
  return {
    status: response.status,
    data: await response.text(),
    headers: Object.fromEntries(response.headers),
  };
}

/**
 * Sleep helper for tests
 */
export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
