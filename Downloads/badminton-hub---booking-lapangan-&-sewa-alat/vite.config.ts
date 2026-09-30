import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {adminAuthPlugin} from './server/admin-auth.mjs';
import {htmlPartialsPlugin} from './tooling/html-partials.mjs';

export default defineConfig(() => {
  return {
    plugins: [adminAuthPlugin(), htmlPartialsPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      fs: { deny: ['.env', '.env.*', '**/server/**', '**/scripts/**', '**/*.test.mjs', '**/.git/**'] },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
