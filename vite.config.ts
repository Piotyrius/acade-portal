/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Ensure public files are copied correctly
  publicDir: "public",
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split vendor libraries into separate chunks
          if (id.includes('node_modules')) {
            // React and React DOM
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // Chart libraries (recharts)
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            // Date libraries
            if (id.includes('date-fns')) {
              return 'vendor-dates';
            }
            // React Query
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            // i18n libraries
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'vendor-i18n';
            }
            // UI component libraries (lucide-react, etc.)
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Other large vendor libraries
            if (id.includes('react-big-calendar')) {
              return 'vendor-calendar';
            }
            // All other node_modules
            return 'vendor';
          }
          // Split Reporting page into its own chunk (it's large with charts)
          if (id.includes('/pages/reporting/')) {
            return 'page-reporting';
          }
          // Split Documents page (it's also large)
          if (id.includes('/pages/documents/') || id.includes('/components/documents/')) {
            return 'page-documents';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600, // Increase limit slightly since we're splitting chunks
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/exampleData',
        '**/__tests__/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'dist/',
        'build/',
        'coverage/',
        'public/',
      ],
      include: ['src/**/*.{ts,tsx}'],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60,
      },
    },
  },
}));
