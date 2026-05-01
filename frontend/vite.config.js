import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
 
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
 
  server: {
    // Proxy /api calls to Spring Boot when running locally (npm run dev)
    // In Docker, Nginx handles this routing instead.
    proxy: {
      '/api': {
        target: 'https://localhost',
        changeOrigin: true,
        secure: false,  // Allow self-signed certs
      },
      '/auth': {
        target: 'https://localhost',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})