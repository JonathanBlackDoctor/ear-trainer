import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Logic tests run in node; component tests (*.test.tsx) opt into jsdom via
// environmentMatchGlobs. Run with `npm test` (watch) or `npm run test:run` (CI).
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    environmentMatchGlobs: [['src/**/*.test.tsx', 'jsdom']],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    globals: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/engine/**/*.ts', 'src/store/**/*.ts', 'src/theory/**/*.ts'],
      exclude: ['**/*.test.ts', '**/__tests__/**'],
    },
  },
});
