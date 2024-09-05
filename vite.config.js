// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/url': {
        target: 'http://100.26.185.72:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/url/, ''),
      },
    },
  },
});
