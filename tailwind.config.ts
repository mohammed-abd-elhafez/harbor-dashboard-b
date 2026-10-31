import type { Config } from 'tailwindcss';

// Preflight is off on purpose: the reference layout relies on content-box (spec 5.1).
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  corePlugins: { preflight: false },
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
