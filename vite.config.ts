import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Dev-only: forwards /api calls to the JobPortalAPI backend, sidestepping CORS.
      '/api': {
        target: 'http://localhost:5237',
        changeOrigin: true,
      },
    },
  },
})
