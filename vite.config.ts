import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 3000,      // Forces the main dev server to 3000
    strictPort: true // Prevents Vite from jumping to 3001 automatically
  },
  preview: {
    port: 3000,
    strictPort: true
  }
});