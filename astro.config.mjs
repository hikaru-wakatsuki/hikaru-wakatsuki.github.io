import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  server: {
    port: 5173,
    host: true
  },

  vite: {
    plugins: [tailwindcss()]
  }
});