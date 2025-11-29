
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
  
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // During dev, proxy API calls to backend running on port 5000
    proxy: {
      '/api': 'http://localhost:5000',
      '/health': 'http://localhost:5000'
    },
    port: 3000  // Run on port 3000 (matches CORS setting in backend)
  }
})