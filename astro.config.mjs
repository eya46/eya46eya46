// @ts-check
import { defineConfig, envField } from "astro/config";
import tailwind from "@astrojs/tailwind";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  site: "https://eya46.com",
  integrations: [tailwind()],
  output: "server",
  server: {
    port: 4321,
    host: process.env.HOST || "0.0.0.0",
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
  env: {
    schema: {
      WAKATIME_TOKEN: envField.string({
        context: "server",
        access: "secret",
      }),
      HALO_URL: envField.string({
        context: "server",
        access: "secret",
      }),
      HALO_TOKEN: envField.string({
        context: "server",
        access: "secret",
      }),
    },
  },
});
