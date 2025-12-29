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
            // Keep React core together - don't split React/ReactDOM as they need to load first
            // Chart libraries (recharts) - large and can be lazy loaded
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            // React Big Calendar - large and can be lazy loaded
            if (id.includes('react-big-calendar')) {
              return 'vendor-calendar';
            }
            // All other node_modules stay in main vendor chunk
            // This ensures React loads properly
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
