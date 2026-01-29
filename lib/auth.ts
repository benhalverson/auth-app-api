/**
 * Better-Auth Configuration
 * 
 * Single source of truth for authentication setup
 * Works with both CLI commands and runtime execution
 * Uses cloudflare:workers import for D1 database access
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../src/db/schema";
import { admin, oneTap, openAPI, twoFactor } from "better-auth/plugins";

 /**
 * Create and export auth instance
 * 
 * This can be called with either:
 * 1. D1Database binding (at runtime in Cloudflare Worker)
 * 2. process.env.DB (via nodejs_compat_populate_process_env flag)
 * 
 * Supports all better-auth plugins:
 * - twoFactor: Two-factor authentication support
 * - oneTap: Google One Tap integration
 * - admin: Role-based access control
 * - openAPI: OpenAPI schema generation
 */
export function createAuth(database: D1Database) {
  const db = drizzle(database, { schema });

  return betterAuth({
    // Database configuration with Drizzle adapter
    database: drizzleAdapter(db, {
      provider: "sqlite",
    }),

    // Email and password authentication
    emailAndPassword: {
      enabled: true,
    },

    // Account linking configuration
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google"],
      },
    },

    // Security configuration
    trustedOrigins: [
      "http://localhost:5173",
      // Add production origins here
    ],

    // Plugins for extended functionality
    plugins: [
      twoFactor(), // Two-factor authentication
      oneTap(), // Google One Tap
      admin(), // Role-based access control
      openAPI(), // OpenAPI documentation
    ],

    // Optional: Enable experimental database joins for better performance
    experimental: {
      joins: false, // Set to true after database schema includes relations
    },
  });
}

// Type for the Better Auth instance
export type Auth = ReturnType<typeof createAuth>;

// Export auth factory for convenience
// Note: In Cloudflare Workers, use createAuth(c.env.users) to create instance per request
export default createAuth;
