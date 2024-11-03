// @ts-check
import eslintPluginAstro from "eslint-plugin-astro";
import eslint from "@eslint/js";
import typescript from "typescript-eslint";

export default [
  eslint.configs.recommended,
  ...typescript.configs.recommended,
  ...eslintPluginAstro.configs.all,
  {
    name: "app/files-to-lint",
    files: ["**/*.{ts,mts,tsx,vue,astro}"],
  },

  {
    name: "app/files-to-ignore",
    ignores: ["**/dist/**", "**/dist-ssr/**", "**/coverage/**", "atest/**"],
  },
  {
    rules: {
      "@typescript-eslint/triple-slash-reference": "off", // 禁用三斜杠引用检查
      "@typescript-eslint/no-explicit-any": "off", // 禁用 any 类型检查
    },
  },
];
