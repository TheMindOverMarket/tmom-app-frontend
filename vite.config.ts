import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // TODO(MARKETDATA_CANONICAL): Remove this proxy once we switch to backend Market Data Service.
      '/api/coinbase': {
        target: 'https://api.exchange.coinbase.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/coinbase/, ''),
      },
      // TODO(MARKETDATA_CANONICAL): Remove this leftover Binance proxy if not used, or keep for potential future use.
      // '/api/binance': { ... } 
      
      // Proxy for TMOM Backend (Rule Engine) to bypass CORS
      '/api/backend': {
        target: 'https://tmom-app-backend.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/backend/, ''),
      },
    },
  },
})
