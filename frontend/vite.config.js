import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['d734d0fd88e3.ngrok-free.app'], // ✅ Thêm dòng này
  },
})
