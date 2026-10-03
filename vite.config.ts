import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Served from the domain root (Cloudflare Pages): absolute asset URLs keep refreshes on any path working.
  base: "/",
  plugins: [react(), tailwindcss()],
  // three.js (~136 kB gzip) is lazy-loaded in its own chunk, only once the questions show.
  build: { chunkSizeWarningLimit: 600 },
});
