import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// The API runs on 4000 by default (see .env.example). Probes are unversioned,
// API routes live under /api.
const apiTarget = 'http://localhost:4000';

export default defineConfig({
  plugins: [react()],
  // Single source of env values: the repository root .env.
  envDir: '../../',
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true },
      '/health': { target: apiTarget, changeOrigin: true },
      '/ready': { target: apiTarget, changeOrigin: true },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    restoreMocks: true,
  },
});
