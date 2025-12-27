import { expect, test } from "./fixtures";
import { PopupPage } from "./pages/popup";

const MOCK_URL = "http://localhost:3456/learn";

test.describe("MA Grid Extension", () => {
  test("should load extension and display calendar on dashboard", async ({
    page,
  }) => {
    await page.goto(MOCK_URL, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("networkidle");

    page.locator("#ma-grid-ui").locator(".ma-grid__cell").first();

    await expect(
      page.locator("#ma-grid-ui").locator(".ma-grid__cell").first()
    ).toBeVisible();
  });

  test("should open popup and display settings", async ({
    context,
    extensionId,
  }) => {
    const popupPage = await context.newPage();
    const popup = new PopupPage(popupPage, extensionId);
    await popup.open();

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
    await page.goto(MOCK_URL, {
      waitUntil: "domcontentloaded",
    });

    await page
      .locator("#ma-grid-ui")
      .locator(".ma-grid__cell")
      .first()
      .waitFor();

    const popupPage = await context.newPage();
    const popup = new PopupPage(popupPage, extensionId);
    await popup.open();
    await popup.selectAnchor("sidebar");

    await page.bringToFront();
    await expect(
      page.locator("#ma-grid-ui").locator(".ma-grid.ma-grid--sidebar")
    ).toBeVisible();

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
    await page.goto(MOCK_URL, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("networkidle");

    const initiallyVisible = await page.locator("#xpFrame").isVisible();

    const popupPage = await context.newPage();
    const popup = new PopupPage(popupPage, extensionId);
    await popup.open();
    await popup.toggleHideXpFrame(!initiallyVisible);

    await page.bringToFront();
    const afterToggleVisible = await page.locator("#xpFrame").isVisible();
    expect(afterToggleVisible).toBe(initiallyVisible);
  });

  test("should clear cache successfully", async ({
    page,
    context,
    extensionId,
  }) => {
    await page.goto(MOCK_URL, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("networkidle");

    page.locator("#ma-grid-ui").locator(".ma-grid__cell").first();

    const popupPage = await context.newPage();
    const popup = new PopupPage(popupPage, extensionId);
    await popup.open();

    await popup.clickClearCache();
    await popup.waitForCacheCleared();

    const buttonText = await popup.getClearCacheButtonText();
    expect(buttonText).toBe("Cleared");

    await page.bringToFront();
    await page.reload();
    const loading = page.locator("#ma-grid-ui").locator(".ma-grid__loading");
    await expect(loading).toBeVisible();
  });
});
