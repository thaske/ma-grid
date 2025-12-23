import { test as base, chromium, type BrowserContext } from "@playwright/test";
import path from "path";

const pathToExtension = path.resolve(".output/chrome-mv3");
const userDataDir = path.resolve(".playwright-state/user-data");

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    let background: { url(): string };

    if (pathToExtension.includes("mv3")) {
      [background] = context.serviceWorkers();
      if (!background) background = await context.waitForEvent("serviceworker");
    } else {
      [background] = context.backgroundPages();
      if (!background)
        background = await context.waitForEvent("backgroundpage");
    }

    const extensionId = background.url().split("/")[2];

    await use(extensionId);
  },
});
export const expect = test.expect;
