import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build` -> normal multi-page site for Cloudflare (dist/).
// `npm run build:preview` -> one self-contained index.html (dist-single/) for sharing previews.
export default defineConfig(({ mode }) => {
  if (mode === 'single') {
    return {
      plugins: [viteSingleFile()],
      build: { outDir: 'dist-single', emptyOutDir: true },
    };
  }
  return {
    build: {
      rollupOptions: {
        input: {
          main: resolve(import.meta.dirname, 'index.html'),
          rules: resolve(import.meta.dirname, 'rules.html'),
        },
      },
    },
  };
});
