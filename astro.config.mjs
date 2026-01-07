// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import vue from '@astrojs/vue';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    server: {
      headers: {
        // Ensure proper MIME types for worker files
        '.js': 'application/javascript',
        '.wasm': 'application/wasm',
        '.worker.js': 'application/javascript'
      }
    },
    optimizeDeps: {
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/core']
    }
  },
  integrations: [vue({
      devtools: true,
      template: {
        compilerOptions: {
          // Tratar todas las etiquetas con un guion como elementos personalizados
          isCustomElement: (tag) => tag.includes('-')
        }
      }
    })],
      site: 'https://nglmercer.github.io/trygger_overlay',
      base: '/trygger_overlay',
});