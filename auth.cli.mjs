// Node-only Better Auth entry for the CLI.
// This file is NOT used by the Cloudflare Worker at runtime.
// It exports a top-level `auth` instance so `npx @better-auth/cli generate` can find it.

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

// Try to include the passkey plugin so CLI generates its schema too.
let passkeyPlugin;
try {
  // Newer versions may export passkey from a path module
  ({ passkey: passkeyPlugin } = await import("better-auth/plugins/passkey"));
} catch (_) {
  try {
    // Fallback to the root plugins export
    ({ passkey: passkeyPlugin } = await import("better-auth/plugins"));
  } catch (_) {
    passkeyPlugin = undefined;
  }
}

const sqlite = new Database("./dev.sqlite");
const db = drizzle(sqlite);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    ...(passkeyPlugin ? [passkeyPlugin()] : []),
  ],
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:8787",
  secret: process.env.BETTER_AUTH_SECRET || "dev-secret-change-me",
});
