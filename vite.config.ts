import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // TODO Proxy for TMOM Backend (Rule Engine) to bypass CORS (move cors * to backend)
      '/api/backend': {
        target: 'https://tmom-app-backend.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/backend/, ''),
      },
    },
  },
})
