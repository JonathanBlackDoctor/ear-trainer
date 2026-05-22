import { defineConfig } from 'vitest/config';

// Pure-logic test config. No jsdom — component tests (RTL) are deferred. Run
// with `npm test` (watch) or `npm run test:run` (CI).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    globals: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/engine/**/*.ts', 'src/store/**/*.ts', 'src/theory/**/*.ts'],
      exclude: ['**/*.test.ts', '**/__tests__/**'],
    },
  },
});
