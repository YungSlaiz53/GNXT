import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      'node:util': path.resolve(__dirname, 'src/node-util-shim.ts'),
      'util': path.resolve(__dirname, 'src/node-util-shim.ts'),
      'node-fetch': path.resolve(__dirname, 'src/node-fetch-shim.ts'),
      'cross-fetch': path.resolve(__dirname, 'src/node-fetch-shim.ts'),
      'node:stream': path.resolve(__dirname, 'src/empty-shim.ts'),
      'node:buffer': path.resolve(__dirname, 'src/empty-shim.ts'),
      'node:crypto': path.resolve(__dirname, 'src/empty-shim.ts'),
      'node:process': path.resolve(__dirname, 'src/empty-shim.ts'),
      'buffer': path.resolve(__dirname, 'src/empty-shim.ts'),
      'stream': path.resolve(__dirname, 'src/empty-shim.ts'),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
  server: {
    port: 3000,
  },
});
