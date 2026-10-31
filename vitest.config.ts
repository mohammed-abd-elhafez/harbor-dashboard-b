import { defineConfig } from 'vitest/config';

// Separate from vite.config.ts: vitest bundles its own vite, so sharing the React plugin type-clashes.
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/unit/setup.ts'],
  },
});
