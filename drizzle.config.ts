import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'sqlite',
  // For local development, D1 database file is managed by wrangler
  // drizzle-kit will work with CLI commands directly
});