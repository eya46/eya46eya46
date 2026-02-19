// @ts-check
import { defineConfig, envField, passthroughImageService } from "astro/config";
import { loadEnv } from "vite";

import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import vue from "@astrojs/vue";
import tailwindcss from "@tailwindcss/vite";

// 在 astro.config 阶段 .env 尚未被 Vite 解析，需手动加载
const { NEZHA_HOST } = loadEnv(process.env.NODE_ENV ?? "", process.cwd(), "");

// https://astro.build/config
export default defineConfig({
  site: "https://www.eya46.com",
  integrations: [sitemap(), vue()],
  output: "server",
  server: {
    port: 4321,
    // eslint-disable-next-line no-undef
    host: process.env.HOST || "0.0.0.0",
  },
  adapter: node({
    mode: "standalone",
  }),
  image: {
    service: passthroughImageService(),
  },
  vite: {
    ssr: {
      noExternal: process.env.NODE_ENV === "production" ? true : undefined,
    },
    plugins: [tailwindcss()],
    server: {
      proxy: {
        "/api/v1/ws/server": {
          target: `wss://${NEZHA_HOST}/`,
          ws: true,
          changeOrigin: true,
          headers: {
            Origin: `https://${NEZHA_HOST}/`,
          },
        },
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
      NEZHA_HOST: envField.string({
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
