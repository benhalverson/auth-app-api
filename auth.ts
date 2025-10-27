// Node-only Better Auth entry for the CLI.
// This file is NOT used by the Cloudflare Worker at runtime.
// It exports a top-level `auth` instance so `npx @better-auth/cli generate` can find it.

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./src/db/schema";

// If you enabled plugins (e.g., passkey), include them here so the CLI can generate schema for them.
// If your project uses other plugins, add them in the plugins array below.
// eslint-disable-next-line import/no-extraneous-dependencies
import { passkey } from "better-auth/plugins/passkey";
import { admin, oneTap } from "better-auth/plugins";

// For CLI generation we don't need a persistent DB; use an in-memory SQLite.
// This file is only for the CLI to locate your auth config and plugins.
const sqlite = new Database(":memory:");
const db = drizzle(sqlite, { schema });

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    // If your Drizzle tables use plural names, you can enable the following:
    // usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    passkey(),
    oneTap(),
    admin(),
  ],
  // Optional but harmless for CLI; helps when CLI reads config
  // Optional for CLI; you can configure these in your Worker env at runtime
  // baseURL: process.env.BETTER_AUTH_URL,
  // secret: process.env.BETTER_AUTH_SECRET,
});
