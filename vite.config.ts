import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          mui: ["@mui/material", "@mui/icons-material"],
          i18n: ["i18next", "react-i18next", "i18next-http-backend"],
          date: ["date-fns", "date-fns-tz"],
        },
      },
    },
  },
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      // Add any path aliases if needed
    },
  },
  optimizeDeps: {
    include: [
      "i18next",
      "react-i18next",
      "i18next-http-backend",
      "date-fns",
      "date-fns-tz",
    ],
    esbuildOptions: {
      target: "es2020",
    },
  },
});
