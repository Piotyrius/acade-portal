import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { copyFileSync, existsSync } from "fs";

// Plugin to ensure _redirects file is copied to build output
const ensureRedirectsPlugin = () => {
  return {
    name: "ensure-redirects",
    closeBundle() {
      const redirectsSource = path.resolve(__dirname, "public", "_redirects");
      const redirectsDest = path.resolve(__dirname, "dist", "_redirects");
      
      if (existsSync(redirectsSource)) {
        copyFileSync(redirectsSource, redirectsDest);
        console.log("✅ Copied _redirects file to dist/");
      } else {
        console.warn("⚠️ _redirects file not found in public/");
      }
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    ensureRedirectsPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Ensure public files are copied correctly
  publicDir: "public",
}));
