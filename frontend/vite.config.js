import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxy = {
    '/geoserver': {
      target: env.GEOSERVER_URL || 'http://[::1]:8081',
      changeOrigin: true,
    },
  };

  return {
    plugins: [react()],
    build: {
      rollupOptions: { output: { manualChunks: { react: ['react', 'react-dom/client'] } } },
    },
    server: {
      port: 5173,
      host: '127.0.0.1',
      strictPort: true,
      proxy,
    },
    preview: {
      port: 4173,
      host: '127.0.0.1',
      strictPort: true,
      proxy,
    },
    test: {
      environment: 'node',
      include: ['src/**/*.test.js'],
    },
  };
});
