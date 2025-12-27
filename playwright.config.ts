import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  globalSetup: "e2e/global-setup.ts",
  webServer: {
    command: "bun e2e/mocks/src/server.ts",
    port: 3456,
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
  },
});
