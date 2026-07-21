import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.openweathermap\.org\/.*/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "weather-cache",
              expiration: { maxAgeSeconds: 3600 },
            },
          },
          {
            urlPattern: /^https:\/\/.*supabase\.co\/.*/,
            handler: "NetworkFirst",
            options: { cacheName: "supabase-cache" },
          },
          {
            urlPattern: /^https:\/\/.*azure\.com\/.*/,
            handler: "NetworkFirst",
            options: { cacheName: "azure-cache" },
          },
        ],
      },
      manifest: {
        name: "जलशेती प्रो",
        short_name: "JalSheti",
        description: "ऊसासाठी स्मार्ट पाणी व्यवस्थापन",
        theme_color: "#2E7D32",
        background_color: "#F1F8E9",
        display: "standalone",
        orientation: "portrait",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
