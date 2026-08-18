/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    // Pre-transform the entry module graph when the dev server starts so the
    // first browser hit does not pay the on-demand compile cost on the main
    // thread (dev-mode first-paint fix on slow/constrained machines).
    warmup: {
      clientFiles: [
        './src/main.tsx',
        './src/App.tsx',
        './src/routes/AppRouter.tsx',
        './src/providers/AppProviders.tsx',
        './src/styles/index.ts',
      ],
    },
    proxy: {
      // Proxy API calls to the Spring Cloud API Gateway during development
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    // Pre-bundle the heavy vendor libraries at server boot instead of on the
    // first page request, so initial render is not blocked by dependency
    // discovery + esbuild optimization (avoids the dev-mode "optimizing
    // dependencies" stall on first load).
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-redux',
      '@reduxjs/toolkit',
      'redux-persist',
      '@mui/material',
      '@emotion/react',
      '@emotion/styled',
      '@tanstack/react-query',
      'framer-motion',
      'axios',
      'dayjs',
      'react-hot-toast',
      'react-hook-form',
      '@hookform/resolvers',
      'zod',
    ],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Split stable vendor libraries into separate cacheable chunks so the
        // browser downloads them once and never re-parses them on navigation.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('/react/') || id.includes('/react-dom') || id.includes('/react-router')) {
            return 'react-vendor';
          }
          if (id.includes('@mui') || id.includes('@emotion')) {
            return 'mui-vendor';
          }
          if (id.includes('@reduxjs') || id.includes('react-redux') || id.includes('redux-persist')) {
            return 'state-vendor';
          }
          if (id.includes('@tanstack')) {
            return 'query-vendor';
          }
          if (id.includes('framer-motion')) {
            return 'motion-vendor';
          }
          if (id.includes('react-hook-form') || id.includes('/zod/') || id.includes('@hookform')) {
            return 'forms-vendor';
          }
          if (id.includes('/axios/') || id.includes('/dayjs/') || id.includes('react-hot-toast')) {
            return 'utils-vendor';
          }
          return undefined;
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    css: false,
    // The suite renders heavy MUI + framer-motion pages in jsdom; running too
    // many files at once starves the CPU and makes fixed-sleep tests flake.
    // Cap parallelism so timing (not contention) decides results.
    maxWorkers: 4,
    fileParallelism: true,
    // Heavy MUI + framer-motion pages render slowly when the whole suite runs
    // in parallel; individual renders can take >20s, so keep the budget well
    // above the slowest test (assertions still run against real content).
    testTimeout: 40000,
    hookTimeout: 30000,
  },
});
