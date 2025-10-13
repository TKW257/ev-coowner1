import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['06b84f1c825d.ngrok-free.app'], // ✅ Thêm dòng này
  },
})
