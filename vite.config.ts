import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// VITE_BASE lets the same build run from a sub-path such as GitHub Pages.
export default defineConfig({ base: process.env.VITE_BASE ?? '/', plugins: [react()] });
