import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative base so the same dist works on:
  //   • GitHub Pages   https://<user>.github.io/ear-trainer/  → ./assets/...
  //   • Vercel (root)  https://ear-trainer-chi.vercel.app/    → ./assets/...
  // HashRouter (#/route) keeps the document URL fixed, so relative URLs in
  // index.html and runtime fetches (e.g. piano samples) resolve correctly
  // under either origin.
  base: './',
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
