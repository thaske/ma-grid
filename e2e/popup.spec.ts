import { expect, test } from "./fixtures";
import { PopupPage } from "./pages/popup";
import { MOCK_URL } from "./constants";

test.describe("MA Grid Popup", () => {
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
    await expect(popup.currentStreakToggle).toBeVisible();
    await expect(popup.longestStreakToggle).toBeVisible();
    await expect(popup.avgXpToggle).toBeVisible();
    await expect(popup.maxXpToggle).toBeVisible();
    await expect(popup.clearCacheButton).toBeVisible();
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

    page.locator("#ma-grid").locator(".ma-grid__cell").first();

    const popupPage = await context.newPage();
    const popup = new PopupPage(popupPage, extensionId);
    await popup.open();

    await popup.clickClearCache();
    await popup.waitForCacheCleared();

    const buttonText = await popup.getClearCacheButtonText();
    expect(buttonText).toBe("Cleared");

    await page.bringToFront();
    await page.reload();
    const loading = page.locator("#ma-grid").locator(".ma-grid__loading");
    await expect(loading).toBeVisible();
  });
});
