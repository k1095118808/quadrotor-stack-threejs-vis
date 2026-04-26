import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { readdirSync, statSync } from 'node:fs';

// Walk src/chapters/ to find every chapter HTML so each one gets emitted
// as its own entry. Using a small recursive walker (rather than a glob
// dependency) keeps the build script dep-free.
function collectChapterPages(dir) {
  const out = {};
  for (const name of readdirSync(dir)) {
    const full = resolve(dir, name);
    if (statSync(full).isDirectory()) {
      Object.assign(out, collectChapterPages(full));
    } else if (name.endsWith('.html')) {
      // Key shape: "chapters-ch01-overview-01-stack" — must be unique.
      const key = full
        .slice(__dirname.length + 1)
        .replace(/[\\/]/g, '-')
        .replace(/\.html$/, '');
      out[key] = full;
    }
  }
  return out;
}

const chapterPages = collectChapterPages(resolve(__dirname, 'src/chapters'));

export default defineConfig({
  // Cloudflare Pages serves from the apex, so '/' is correct. Override
  // with VITE_BASE='/repo-name/' for GitHub Pages project deploys.
  base: process.env.VITE_BASE ?? '/',
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  build: {
    rollupOptions: {
      input: {
        index:    resolve(__dirname, 'index.html'),
        kitDemo:  resolve(__dirname, 'src/kit-demo.html'),
        ...chapterPages,
      },
    },
  },
});
