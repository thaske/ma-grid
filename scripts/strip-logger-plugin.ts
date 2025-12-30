import type { Plugin } from "vite";

export function stripLogger(
  options: { enabled: boolean } = { enabled: true }
): Plugin {
  return {
    name: "strip-logger",
    transform(code, id) {
      // Skip node_modules
      if (id.includes("node_modules")) return;

      // Only strip in production when enabled
      if (!options.enabled) return;

      let transformedCode = code;
      let hasChanges = false;

      // Remove logger import statements
      const importPattern =
        /import\s+{[^}]*logger[^}]*}\s+from\s+['"]@\/utils\/logger['"];?\s*\n?/g;
      if (importPattern.test(transformedCode)) {
        transformedCode = transformedCode.replace(importPattern, "");
        hasChanges = true;
      }

      // Remove logger method calls with proper parentheses matching
      // This handles nested parentheses correctly
      const loggerCallPattern = /logger\.(log|warn|error)\s*\(/g;
      let match;
      const replacements: Array<{ start: number; end: number }> = [];

      while ((match = loggerCallPattern.exec(transformedCode)) !== null) {
        const start = match.index;
        let depth = 0;
        let end = -1;

        // Find the matching closing parenthesis
        for (
          let i = match.index + match[0].length;
          i < transformedCode.length;
          i++
        ) {
          if (transformedCode[i] === "(") depth++;
          else if (transformedCode[i] === ")") {
            if (depth === 0) {
              end = i + 1;
              // Include trailing semicolon if present
              if (transformedCode[i + 1] === ";") end++;
              break;
            }
            depth--;
          }
        }

        if (end !== -1) {
          replacements.push({ start, end });
          hasChanges = true;
        }
      }

      // Apply replacements in reverse order to maintain indices
      for (let i = replacements.length - 1; i >= 0; i--) {
        const { start, end } = replacements[i];
        transformedCode =
          transformedCode.slice(0, start) + transformedCode.slice(end);
      }

      // Only return if we actually made changes
      if (hasChanges) {
        return {
          code: transformedCode,
          map: null,
        };
      }
    },
  };
}
