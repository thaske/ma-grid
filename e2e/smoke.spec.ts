import { expect, test } from "./fixtures";
import { PopupPage } from "./pages/popup";

const USERNAME = process.env.MATHACADEMY_USERNAME;
const PASSWORD = process.env.MATHACADEMY_PASSWORD;

test.describe("MA Grid Extension", () => {
  test.skip(
    !USERNAME || !PASSWORD,
    "Set MATHACADEMY_USERNAME and MATHACADEMY_PASSWORD to run these tests."
  );

  test("should load extension and display calendar on dashboard", async ({
    page,
  }) => {
    // Login
    await page.goto("https://mathacademy.com/login", {
      waitUntil: "domcontentloaded",
    });

    await page.locator("#usernameOrEmail").fill(USERNAME ?? "");
    await page.locator("#password").fill(PASSWORD ?? "");
    await page.locator("form").press("Enter");

    await page.waitForURL(
      (url) =>
        url.hostname === "mathacademy.com" &&
        !url.pathname.startsWith("/login"),
      { timeout: 30_000 }
    );
    await page.waitForLoadState("networkidle");

    // Wait for calendar to render
    await page.waitForSelector("ma-grid-ui", { timeout: 15000 });

    // Basic check that calendar exists and has content
    const calendarExists = await page.evaluate(() => {
      const shadowHost = document.querySelector("ma-grid-ui");
      if (!shadowHost?.shadowRoot) return false;
      const cells = shadowHost.shadowRoot.querySelectorAll(".ma-grid__cell");
      return cells.length > 0;
    });

    expect(calendarExists).toBe(true);
  });

  test("should open popup and display settings", async ({
    page,
    context,
    extensionId,
  }) => {
    // Simple login to ensure extension is active
    await page.goto("https://mathacademy.com/login");
    await page.locator("#usernameOrEmail").fill(USERNAME ?? "");
    await page.locator("#password").fill(PASSWORD ?? "");
    await page.locator("form").press("Enter");
    await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
      timeout: 30_000,
    });

    // Open popup
    const popupPage = await context.newPage();
    const popup = new PopupPage(popupPage, extensionId);
    await popup.open();

    // Verify basic popup UI
    await expect(popup.title).toHaveText("MA Grid");
    await expect(popup.settingsHeading).toBeVisible();
    await expect(popup.anchorOptions).toHaveCount(2);
    await expect(popup.hideXpToggle).toBeVisible();
    await expect(popup.clearCacheButton).toBeVisible();
  });
});
