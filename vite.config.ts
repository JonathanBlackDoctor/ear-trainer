import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/ear-trainer/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          tone: ['tone'],
          tonal: ['tonal'],
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
