import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** En Vercel, `VERCEL_GIT_COMMIT_SHA` permite ver en consola si cargas el último deploy. */
const webCommit = process.env.VERCEL_GIT_COMMIT_SHA || 'local';

export default defineConfig({
  define: {
    __WEB_COMMIT__: JSON.stringify(webCommit),
  },
  plugins: [react()],
  server: {
    port: 5173,
    /** Necesario para túneles (ngrok, Cloudflare, pestaña Ports de Cursor) que cambian el host. */
    host: true,
    proxy: {
      '/api': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000',
    },
  },
});
