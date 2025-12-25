import { expect, test } from "./fixtures";
import { PopupPage } from "./pages/popup";

const USERNAME = process.env.MATHACADEMY_USERNAME;
const PASSWORD = process.env.MATHACADEMY_PASSWORD;

test.describe("MA Grid Extension", () => {
  test.skip(
    !USERNAME || !PASSWORD,
    "Set MATHACADEMY_USERNAME and MATHACADEMY_PASSWORD to run these tests."
  );

  test.beforeAll(async ({ page }) => {
    // Try navigating to /learn first to check if already logged in
    await page.goto("https://mathacademy.com/learn", {
      waitUntil: "domcontentloaded",
    });

    // If we're redirected to /login or /session-expired, we need to log in
    const needsLogin =
      page.url().includes("/login") || page.url().includes("/session-expired");

    if (needsLogin) {
      await page.goto("https://mathacademy.com/login");
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
    }
    // Otherwise we're already logged in, no action needed
  });

  test("should load extension and display calendar on dashboard", async ({
    page,
  }) => {
    // Navigate to dashboard (already logged in from beforeAll)
    await page.goto("https://mathacademy.com/learn", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("networkidle");

    // Wait for calendar to render (not just the shadow host)
    await page.waitForFunction(
      () => {
        const shadowHost = document.querySelector("ma-grid-ui");
        if (!shadowHost?.shadowRoot) return false;
        const cells = shadowHost.shadowRoot.querySelectorAll(".ma-grid__cell");
        return cells.length > 0;
      },
      { timeout: 15000 }
    );

    // Verify calendar exists and has content
    const calendarExists = await page.evaluate(() => {
      const shadowHost = document.querySelector("ma-grid-ui");
      if (!shadowHost?.shadowRoot) return false;
      const cells = shadowHost.shadowRoot.querySelectorAll(".ma-grid__cell");
      return cells.length > 0;
    });

    expect(calendarExists).toBe(true);
  });

  test("should open popup and display settings", async ({
    context,
    extensionId,
  }) => {
    // Open popup (already logged in from beforeAll)
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

  test("should move calendar when anchor position changes", async ({
    page,
    context,
    extensionId,
  }) => {
    // Navigate to dashboard (already logged in from beforeAll)
    await page.goto("https://mathacademy.com/learn", {
      waitUntil: "domcontentloaded",
    });

    // Wait for initial calendar in default position (not just loading state)
    await page.waitForFunction(
      () => {
        const shadowHost = document.querySelector("ma-grid-ui");
        if (!shadowHost?.shadowRoot) return false;
        const cells = shadowHost.shadowRoot.querySelectorAll(".ma-grid__cell");
        return cells.length > 0;
      },
      { timeout: 15000 }
    );

    // Open popup and switch to sidebar
    const popupPage = await context.newPage();
    const popup = new PopupPage(popupPage, extensionId);
    await popup.open();
    await popup.selectAnchor("sidebar");

    // Go back to main page and verify calendar moved
    await page.bringToFront();
    await page.waitForTimeout(1000); // Wait for remount

    const calendarInSidebar = await page.evaluate(() => {
      const shadowHost = document.querySelector("ma-grid-ui");
      if (!shadowHost?.shadowRoot) return false;
      const container = shadowHost.shadowRoot.querySelector(".ma-grid");
      return container?.classList.contains("ma-grid--sidebar") ?? false;
    });

    expect(calendarInSidebar).toBe(true);

    // Switch back to dashboard
    await popupPage.bringToFront();
    await popup.selectAnchor("incompleteTasks");
    await page.bringToFront();
    await page.waitForTimeout(1000);

    const calendarInDashboard = await page.evaluate(() => {
      const shadowHost = document.querySelector("ma-grid-ui");
      if (!shadowHost?.shadowRoot) return false;
      const container = shadowHost.shadowRoot.querySelector(".ma-grid");
      return !container?.classList.contains("ma-grid--sidebar");
    });

    expect(calendarInDashboard).toBe(true);
  });

  test("should toggle XP frame visibility", async ({
    page,
    context,
    extensionId,
  }) => {
    // Navigate to dashboard (already logged in from beforeAll)
    await page.goto("https://mathacademy.com/learn", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("networkidle");

    // Check initial XP frame visibility
    const initiallyVisible = await page.evaluate(() => {
      const xpFrame = document.querySelector<HTMLElement>("#xpFrame");
      return xpFrame ? getComputedStyle(xpFrame).display !== "none" : false;
    });

    // Open popup and toggle hide XP frame
    const popupPage = await context.newPage();
    const popup = new PopupPage(popupPage, extensionId);
    await popup.open();
    await popup.toggleHideXpFrame(!initiallyVisible);

    // Verify XP frame visibility changed
    await page.bringToFront();
    await page.waitForTimeout(500);

    const afterToggleVisible = await page.evaluate(() => {
      const xpFrame = document.querySelector<HTMLElement>("#xpFrame");
      return xpFrame ? getComputedStyle(xpFrame).display !== "none" : false;
    });

    expect(afterToggleVisible).toBe(initiallyVisible);
  });

  test("should clear cache successfully", async ({
    page,
    context,
    extensionId,
  }) => {
    // Navigate to dashboard (already logged in from beforeAll)
    await page.goto("https://mathacademy.com/learn", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("networkidle");

    // Wait for calendar to load (ensures cache is populated and loading is complete)
    await page.waitForFunction(
      () => {
        const shadowHost = document.querySelector("ma-grid-ui");
        if (!shadowHost?.shadowRoot) return false;
        const cells = shadowHost.shadowRoot.querySelectorAll(".ma-grid__cell");
        return cells.length > 0;
      },
      { timeout: 15000 }
    );

    // Open popup and clear cache
    const popupPage = await context.newPage();
    const popup = new PopupPage(popupPage, extensionId);
    await popup.open();

    await popup.clickClearCache();
    await popup.waitForCacheCleared();

    // Verify button shows "Cleared" state
    const buttonText = await popup.getClearCacheButtonText();
    expect(buttonText).toBe("Cleared");

    // Go back to main page and verify calendar shows loading UI
    await page.bringToFront();
    await page.reload({ waitUntil: "domcontentloaded" });
    const showsLoadingUI = await page.evaluate(() => {
      const shadowHost = document.querySelector("ma-grid-ui");
      if (!shadowHost?.shadowRoot) return false;
      const loading = shadowHost.shadowRoot.querySelector(".ma-grid__loading");
      return loading !== null;
    });

    await page.waitForTimeout(500);
    expect(showsLoadingUI).toBe(true);
  });
});
