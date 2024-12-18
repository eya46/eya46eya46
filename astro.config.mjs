// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  site: "https://eya46.com",
  integrations: [tailwind()],
  output: "server",
  server: {
    port: 4321,
  },
  adapter: node({
    mode: "standalone",
  }),
  vite: {
    build: {
      rollupOptions: {
        external: ["sharp"],
      },
    },
  },
});
