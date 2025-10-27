import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../src/db/schema";
import { passkey } from 'better-auth/plugins/passkey';
import { admin, oneTap, openAPI } from 'better-auth/plugins';

export function createAuth(database: D1Database) {
  const db = drizzle(database, { schema });

  return betterAuth({
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ['google'],
      }
    },
    trustedOrigins: [
      'http://localhost:5173',
    ],
    database: drizzleAdapter(db, {
      provider: "sqlite",
    }),
    emailAndPassword: {
      enabled: true,
    },
    plugins: [
      passkey(),
      oneTap(),
      admin(),
      openAPI(), 
    ],
  });
}

// Type for the Better Auth instance
export type Auth = ReturnType<typeof betterAuth>;