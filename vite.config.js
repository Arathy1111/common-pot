import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["icon.png"],
      manifest: {
        name: "The Common Pot",
        short_name: "Common Pot",
        description: "A shared household budget tracker.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#0D120D",
        theme_color: "#0D120D",
        icons: [
          { src: "icon.png", sizes: "192x192", type: "image/png" },
          { src: "icon.png", sizes: "512x512", type: "image/png" },
          { src: "icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Cache the app shell so it opens even with a flaky connection;
        // Firestore requests still go over the network for live data.
        globPatterns: ["**/*.{js,css,html,png,svg}"],
      },
    }),
  ],
  server: {
    port: 5173,
  },
});
