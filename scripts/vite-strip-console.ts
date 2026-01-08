import { transform } from "esbuild";
import type { Plugin, ResolvedConfig } from "vite";

const CONSOLE_DROP_TARGETS: Array<"console" | "debugger"> = [
  "console",
  "debugger",
];

export function stripConsolePlugin(): Plugin {
  let enabled = false;
  let sourcemap = false;

  return {
    name: "strip-console",
    apply: "build",
    configResolved(config: ResolvedConfig) {
      enabled = config.mode === "production";
      sourcemap = Boolean(config.build.sourcemap);
    },
    async transform(code, id) {
      if (!enabled || id.includes("node_modules")) {
        return null;
      }

      const cleanId = id.split("?")[0];
      if (!/\.(m?js|ts|tsx|jsx)$/.test(cleanId)) {
        return null;
      }

      const result = await transform(code, {
        loader: "js",
        drop: CONSOLE_DROP_TARGETS,
        sourcemap,
      });

      const map =
        typeof result.map === "string" && result.map.length === 0
          ? null
          : (result.map ?? null);

      return {
        code: result.code,
        map,
      };
    },
  };
}
