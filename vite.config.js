import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Fitmate/',   // nombre exacto del repo en GitHub
  server: {
    port: 3000,
    open: false
  }
})
