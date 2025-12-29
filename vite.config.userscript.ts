/**
 * Vite configuration for userscript build
 * Bundles everything into a single .user.js file
 */

import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { generateMetadata } from "./src/userscript/metadata";

function expandTilde(filepath: string): string {
  if (filepath.startsWith("~/") || filepath === "~") {
    return filepath.replace("~", homedir());
  }
  return filepath;
}

function userscriptHeaderPlugin(outputPath?: string): Plugin {
  return {
    name: "userscript-header",
    closeBundle() {
      const updateURL =
        "https://raw.githubusercontent.com/thaske/ma-grid/master/dist/ma-grid.user.js";
      const downloadURL =
        "https://raw.githubusercontent.com/thaske/ma-grid/master/dist/ma-grid.user.js";
      const headers = generateMetadata(updateURL, downloadURL);

      const filePath = resolve(__dirname, "dist/ma-grid.user.js");
      const content = readFileSync(filePath, "utf-8");
      const finalContent = headers + content;

      writeFileSync(filePath, finalContent);
      console.log("✓ Added userscript headers to ma-grid.user.js");

      if (outputPath) {
        try {
          const expandedPath = expandTilde(outputPath);
          writeFileSync(expandedPath, finalContent);
          console.log(`✓ Copied to ${expandedPath}`);
        } catch (error) {
          console.error(`✗ Failed to copy to ${outputPath}:`, error);
        }
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    build: {
      outDir: "dist",
      emptyOutDir: true,
      lib: {
        entry: resolve(__dirname, "src/userscript/main.ts"),
        name: "MAGrid",
        formats: ["iife"],
        fileName: () => "ma-grid.user.js",
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
      minify: true,
      sourcemap: false,
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
    define: {
      // Polyfill for userscript environment
      "import.meta.env.MODE": JSON.stringify("production"),
    },
    plugins: [userscriptHeaderPlugin(env.USERSCRIPT_OUTPUT_PATH)],
    // Disables copying of the public directory
    publicDir: false,
  };
});
