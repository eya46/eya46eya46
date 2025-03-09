// @ts-check
import { defineConfig, envField, passthroughImageService } from "astro/config";
import tailwind from "@astrojs/tailwind";

import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://www.eya46.com",
  integrations: [tailwind(), sitemap()],
  output: "server",
  server: {
    port: 4321,
    // eslint-disable-next-line no-undef
    host: process.env.HOST || "0.0.0.0",
  },
  adapter: node({
    mode: "standalone",
  }),
  vite: {
    build: {
      rollupOptions: {
        // external: ["sharp"],
      },
    },
    ssr: {
      noExternal: true,
      // external: ["sharp"],
    },
  },
  image: {
    service: passthroughImageService(),
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
      VERSION: envField.string({
        context: "client",
        access: "public",
        optional: true,
        default: "version",
      }),
      GIT_HASH: envField.string({
        context: "client",
        access: "public",
        optional: true,
        default: "master",
      }),
    },
  },
});
