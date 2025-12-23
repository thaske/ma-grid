import { defineConfig } from "wxt";

const hostPermissions = [
  "https://www.mathacademy.com/learn",
  "https://mathacademy.com/learn",
  "https://www.mathacademy.com/api/*",
  "https://mathacademy.com/api/*",
];
const icons = {
  16: "icons/icon16.png",
  32: "icons/icon32.png",
  48: "icons/icon48.png",
  128: "icons/icon128.png",
};
const dontMinify = process.env.MINIFY === "false";

export default defineConfig({
  srcDir: "src",
  manifestVersion: 3,
  manifest: {
    name: "MA Grid",
    permissions: ["storage"],
    host_permissions: hostPermissions,
    icons,
    browser_specific_settings: {
      gecko: {
        data_collection_permissions: {
          required: ["none"],
          optional: [],
        },
      },
    },
  },
  vite: () => ({
    build: {
      minify: !dontMinify,
      sourcemap: true,
    },
  }),
  webExt: {
    chromiumArgs: ["--user-data-dir=./.wxt/chrome-data"],
    startUrls: ["https://mathacademy.com/learn"],
  },
});
