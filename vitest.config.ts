import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'lib/**/*.ts'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.ts',
        '**/dist/**',
      ],
    },
  },
});
