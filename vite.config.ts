import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  cacheDir: process.env.VITE_CACHE_DIR,
  plugins: [react(), tailwindcss()],
})
