import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The engine lives in a sibling workspace package. Alias it straight to its TS
// source so Vite runs it through its own transform pipeline (rather than treating
// it as an opaque dependency), and allow serving files from the repo root.
const engineSrc = fileURLToPath(new URL('../packages/engine/src/index.ts', import.meta.url));
const repoRoot = fileURLToPath(new URL('..', import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@blokus/engine': engineSrc,
    },
  },
  server: {
    port: 5173,
    fs: { allow: [repoRoot] },
  },
});
