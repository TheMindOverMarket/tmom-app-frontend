import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    server: {
      proxy: {
        '/api/backend': {
          target: 'https://tmom-app-backend.onrender.com',
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(/^\/api\/backend/, ''),
        },
        '/api/engine': {
          target: 'https://rule-engine-rcg9.onrender.com',
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(/^\/api\/engine/, ''),
        },
      },
    },
});
