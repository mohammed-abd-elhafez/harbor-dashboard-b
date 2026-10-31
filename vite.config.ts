import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// VITE_BASE lets the same build run from a sub-path such as GitHub Pages.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  // With VITE_USE_MOCKS=false the dev server forwards /api to harbor-api, keeping cookies same-origin.
  server: { proxy: { '/api': { target: process.env.API_URL ?? 'http://localhost:8080', changeOrigin: false } } },
});
