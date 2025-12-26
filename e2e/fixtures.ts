import {
  test as base,
  chromium,
  type BrowserContext,
  type Page,
} from "@playwright/test";
import path from "path";

const pathToExtension = path.resolve(".output/chrome-mv3-test");
const userDataDir = path.resolve(".playwright/user-data");

export const test = base.extend<{
  context: BrowserContext;
  page: Page;
  extensionId: string;
}>({
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext(userDataDir, {
      channel: "chromium",
      headless: !!process.env.CI,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    await use(context);
    await context.close();
  },
  page: async ({ context }, use) => {
    // Get the first page from the persistent context
    const pages = context.pages();
    const page = pages.length > 0 ? pages[0] : await context.newPage();
    await use(page);
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
