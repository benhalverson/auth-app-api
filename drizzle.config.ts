import {defineConfig} from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: "./.wrangler/state/v3/d1/miniflare-D1DatabaseObject/69cf81ad647641fe15510c7addce7fc3637472e6623905c0521b3dc8c0c5cded.sqlite",
  }
});