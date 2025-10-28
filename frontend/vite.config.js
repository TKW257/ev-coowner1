import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ["unbackward-imperviously-hiram.ngrok-free.dev"],
  },
});
