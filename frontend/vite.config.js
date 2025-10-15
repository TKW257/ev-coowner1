import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
<<<<<<< Updated upstream
    allowedHosts: ['06b84f1c825d.ngrok-free.app'], // ✅ Thêm dòng này
=======
    allowedHosts: ['7bae0c3e59df.ngrok-free.app'], // ✅ Thêm dòng này
>>>>>>> Stashed changes
  },
})
