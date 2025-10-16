import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['caleb-idiomatic-milissa.ngrok-free.dev'], // ✅ Thêm dòng này
  },
})
