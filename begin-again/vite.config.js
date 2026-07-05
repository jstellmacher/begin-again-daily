import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/create-checkout-session': 'http://localhost:3001',
      '/verify-session': 'http://localhost:3001',
    },
  },
})
