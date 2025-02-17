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
        default: "git-hash",
      }),
    },
  },
});
