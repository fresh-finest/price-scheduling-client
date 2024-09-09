// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/url': {
        target: 'https://api.priceobo.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/url/, ''),
      },
    },
  },
});
