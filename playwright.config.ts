import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, ".env") });

const ONE_SECOND = 1000;

export default defineConfig({
  testDir: "e2e",
  globalSetup: "./e2e/global-setup.ts",

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: process.env.CI ? "line" : "html",

  use: {
    trace: "on-first-retry",
  },

  webServer: {
    command: "bun e2e/fixtures/server.ts",
    port: 3456,
    reuseExistingServer: !process.env.CI,
    timeout: 30 * ONE_SECOND,
    stdout: "pipe",
    stderr: "pipe",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
