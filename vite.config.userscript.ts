import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { generateMetadata } from "./scripts/metadata";
import { stripLogger } from "./scripts/strip-logger-plugin";

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
      const packageJsonPath = resolve(__dirname, "package.json");
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

      const repoUrl = packageJson.repository?.url || "";
      const githubMatch = repoUrl.match(/github\.com[:/](.+?)(?:\.git)?$/);
      const repoPath = githubMatch?.[1] || "thaske/ma-grid";

      const updateURL = `https://github.com/${repoPath}/releases/latest/download/ma-grid.user.js`;
      const downloadURL = `https://github.com/${repoPath}/releases/latest/download/ma-grid.user.js`;
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
        entry: resolve(__dirname, "src/entrypoints/userscript/main.ts"),
        name: "MAGrid",
        formats: ["iife"],
        fileName: () => "ma-grid.user.js",
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
      minify: false,
      sourcemap: false,
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
    define: {
      "import.meta.env.MODE": JSON.stringify("production"),
    },
    plugins: [
      stripLogger({ enabled: true }),
      userscriptHeaderPlugin(env.USERSCRIPT_OUTPUT_PATH),
    ],
    publicDir: false,
  };
});
