// Build setup for the kb export: .svx pages through mdsvex, `#lib` -> src/lib, static output.
import { fileURLToPath } from 'node:url';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    sveltekit({
      extensions: ['.svelte', '.svx'],
      preprocess: [
        // mdsvex 0.12 is the classic preprocessor the kb pages were written for
        mdsvex({ extensions: ['.svx'], layout: { runbook: fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url)) } }),
        vitePreprocess(),
      ],
      adapter: adapter({ pages: 'build', assets: 'build', strict: false }),
      alias: { '#lib': 'src/lib' },
      prerender: { entries: ['/kb'], handleHttpError: 'warn' },
    }),
  ],
});
