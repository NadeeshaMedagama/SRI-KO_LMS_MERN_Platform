import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Ensure _redirects file is copied to dist
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  // Ensure public files (including _redirects) are copied to dist
  publicDir: 'public',
});
