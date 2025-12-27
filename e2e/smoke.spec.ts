import { expect, test } from "./fixtures";
import { PopupPage } from "./pages/popup";

const MOCK_URL = "http://localhost:3456/learn";

test.describe("MA Grid Extension", () => {
  test("should load extension and display calendar on dashboard", async ({
    page,
  }) => {
    // Navigate to mock dashboard
    await page.goto(MOCK_URL, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("networkidle");

    // Wait for calendar to render (not just the shadow host)
    page.locator("#ma-grid-ui").locator(".ma-grid__cell").first();

    // Verify calendar exists and has content
    await expect(
      page.locator("#ma-grid-ui").locator(".ma-grid__cell").first()
    ).toBeVisible();
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
    // Navigate to mock dashboard
    await page.goto(MOCK_URL, {
      waitUntil: "domcontentloaded",
    });

    // Wait for initial calendar in default position (not just loading state)
    await page
      .locator("#ma-grid-ui")
      .locator(".ma-grid__cell")
      .first()
      .waitFor();

    // Open popup and switch to sidebar
    const popupPage = await context.newPage();
    const popup = new PopupPage(popupPage, extensionId);
    await popup.open();
    await popup.selectAnchor("sidebar");

    // Go back to main page and verify calendar moved
    await page.bringToFront();
    await expect(
      page.locator("#ma-grid-ui").locator(".ma-grid.ma-grid--sidebar")
    ).toBeVisible();

    // Switch back to dashboard
    await popupPage.bringToFront();
    await popup.selectAnchor("incompleteTasks");
    await page.bringToFront();
    await expect(
      page.locator("#ma-grid-ui").locator(".ma-grid:not(.ma-grid--sidebar)")
    ).toBeVisible();
  });

  test("should toggle XP frame visibility", async ({
    page,
    context,
    extensionId,
  }) => {
    // Navigate to mock dashboard
    await page.goto(MOCK_URL, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("networkidle");

    // Check initial XP frame visibility
    const initiallyVisible = await page.locator("#xpFrame").isVisible();

    // Open popup and toggle hide XP frame
    const popupPage = await context.newPage();
    const popup = new PopupPage(popupPage, extensionId);
    await popup.open();
    await popup.toggleHideXpFrame(!initiallyVisible);

    // Verify XP frame visibility changed
    await page.bringToFront();
    const afterToggleVisible = await page.locator("#xpFrame").isVisible();
    expect(afterToggleVisible).toBe(initiallyVisible);
  });

  test("should clear cache successfully", async ({
    page,
    context,
    extensionId,
  }) => {
    // Navigate to mock dashboard
    await page.goto(MOCK_URL, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("networkidle");

    // Wait for calendar to load (ensures cache is populated and loading is complete)
    page.locator("#ma-grid-ui").locator(".ma-grid__cell").first();

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
    await page.reload();
    const loading = page.locator("#ma-grid-ui").locator(".ma-grid__loading");
    await expect(loading).toBeVisible();
  });
});
