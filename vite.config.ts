import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Relative base so the same dist works on:
  //   • GitHub Pages   https://<user>.github.io/ear-trainer/  → ./assets/...
  //   • Vercel (root)  https://ear-trainer-chi.vercel.app/    → ./assets/...
  // HashRouter (#/route) keeps the document URL fixed, so relative URLs in
  // index.html and runtime fetches (e.g. piano samples) resolve correctly
  // under either origin.
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: '음감 훈련',
        short_name: '음감 훈련',
        description: '교회 반주자를 위한 귀 훈련 — 인터벌·코드·진행·솔페지·리듬',
        lang: 'ko',
        dir: 'ltr',
        theme_color: '#3730a3',
        background_color: '#fdfcf8',
        display: 'standalone',
        orientation: 'portrait',
        scope: './',
        start_url: './',
        icons: [
          { src: 'icons/icon-192.png',     sizes: '192x192', type: 'image/png',                       },
          { src: 'icons/icon-512.png',     sizes: '512x512', type: 'image/png'                        },
          { src: 'icons/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'  },
        ],
      },
      workbox: {
        // App shell + assets (JS/CSS) get the standard auto-update flow.
        globPatterns: ['**/*.{js,css,html,svg,ico}'],
        // Don't precache the 32 piano samples — too large for the install
        // budget. They go through runtime caching below instead.
        globIgnores: ['**/samples/**'],
        // Bumped so a single sample (~1MB) never trips the warn-on-size guard.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            // Piano samples: long-lived, never change → CacheFirst.
            urlPattern: /\/samples\/piano\/.*\.mp3$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'piano-samples',
              expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts stylesheets.
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-css',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts files.
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
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
