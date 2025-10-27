import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../src/db/schema";
import { passkey } from 'better-auth/plugins/passkey';
import { admin, oneTap } from 'better-auth/plugins';

// Per Better Auth docs, you should export an `auth` instance.
// In Cloudflare Workers, we need the D1 binding from Env, so we expose a factory
// that creates the instance per-request using the current Env.
export function createAuth(database: D1Database) {
  const db = drizzle(database, { schema });

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
    }),
    emailAndPassword: {
      enabled: true,
    },
    plugins: [
      passkey(),
      oneTap(),
      admin()
    ]
  });
}

// Type for the Better Auth instance
export type Auth = ReturnType<typeof betterAuth>;