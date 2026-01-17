import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@professor-pixel/types': path.resolve(__dirname, '../../packages/types/src'),
      '@professor-pixel/config': path.resolve(__dirname, '../../packages/config/src'),
      '@professor-pixel/core': path.resolve(__dirname, '../../packages/core/src'),
      '@professor-pixel/python-sandbox': path.resolve(
        __dirname,
        '../../packages/python-sandbox/src',
      ),
      '@professor-pixel/lesson-engine': path.resolve(__dirname, '../../packages/lesson-engine/src'),
    },
  },
  optimizeDeps: {
    include: ['@babylonjs/core', '@babylonjs/loaders', 'react', 'react-dom', 'zustand'],
  },
  build: {
    target: 'esnext',
    sourcemap: true,
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});
