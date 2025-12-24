import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: "src",
  manifestVersion: 3,
  modules: ["./modules/safari.ts", "./modules/firefox.ts"],
  manifest: {
    name: "MA Grid",
    permissions: ["storage"],
    host_permissions: [
      "https://www.mathacademy.com/learn",
      "https://mathacademy.com/learn",
      "https://www.mathacademy.com/api/previous-tasks/*",
      "https://mathacademy.com/api/previous-tasks/*",
    ],
    icons: {
      16: "icons/icon16.png",
      32: "icons/icon32.png",
      48: "icons/icon48.png",
      128: "icons/icon128.png",
    },
  },
  vite: () => ({
    build: {
      minify: process.env.MINIFY !== "false",
      sourcemap: true,
    },
  }),
  webExt: {
    chromiumArgs: ["--user-data-dir=./.wxt/chrome-data"],
    startUrls: ["https://mathacademy.com/learn"],
  },
});
