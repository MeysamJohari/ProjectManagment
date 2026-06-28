import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// loadEnv so VITE_* vars from the ROOT .env (one level up) are available.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '..', '');
  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_API_TOKEN': JSON.stringify(env.VITE_API_TOKEN || ''),
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || ''),
    },
    server: {
      port: 5173,
      strictPort: true,
      open: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:4001',
          changeOrigin: true,
        },
      },
    },
  };
});
