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

    page.locator("#ma-grid").locator(".ma-grid__cell").first();

    await expect(
      page.locator("#ma-grid").locator(".ma-grid__cell").first()
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
    await expect(popup.currentStreakToggle).toBeVisible();
    await expect(popup.longestStreakToggle).toBeVisible();
    await expect(popup.avgXpToggle).toBeVisible();
    await expect(popup.maxXpToggle).toBeVisible();
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

    await page.locator("#ma-grid").locator(".ma-grid__cell").first().waitFor();

    const popupPage = await context.newPage();
    const popup = new PopupPage(popupPage, extensionId);
    await popup.open();
    await popup.selectAnchor("sidebar");

    await page.bringToFront();
    await expect(
      page.locator("#ma-grid").locator(".ma-grid.ma-grid--sidebar")
    ).toBeVisible();

    await popupPage.bringToFront();
    await popup.selectAnchor("incompleteTasks");
    await page.bringToFront();
    await expect(
      page.locator("#ma-grid").locator(".ma-grid:not(.ma-grid--sidebar)")
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

  test("should toggle stats visibility", async ({
    page,
    context,
    extensionId,
  }) => {
    await page.goto(MOCK_URL, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("networkidle");

    await page.locator("#ma-grid").locator(".ma-grid__cell").first().waitFor();

    const popupPage = await context.newPage();
    const popup = new PopupPage(popupPage, extensionId);
    await popup.open();
    await popup.setStatVisibility("currentStreak", true);
    await popup.setStatVisibility("longestStreak", true);
    await popup.setStatVisibility("avgXP", true);
    await popup.setStatVisibility("maxXP", true);

    const currentStreakLabel = page.locator("#ma-grid .ma-grid__stat-label", {
      hasText: "Current Streak",
    });
    const longestStreakLabel = page.locator("#ma-grid .ma-grid__stat-label", {
      hasText: "Longest Streak",
    });
    const avgXpLabel = page.locator("#ma-grid .ma-grid__stat-label", {
      hasText: "Avg Daily XP",
    });
    const maxXpLabel = page.locator("#ma-grid .ma-grid__stat-label", {
      hasText: "Max Daily XP",
    });

    await page.bringToFront();
    await expect(currentStreakLabel).toBeVisible();
    await expect(longestStreakLabel).toBeVisible();
    await expect(avgXpLabel).toBeVisible();
    await expect(maxXpLabel).toBeVisible();

    await popupPage.bringToFront();
    await popup.setStatVisibility("currentStreak", false);
    await popup.setStatVisibility("maxXP", false);

    await page.bringToFront();
    await expect(currentStreakLabel).toHaveCount(0);
    await expect(maxXpLabel).toHaveCount(0);
    await expect(longestStreakLabel).toBeVisible();
    await expect(avgXpLabel).toBeVisible();
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

  test("should not have colliding month labels", async ({ page }) => {
    await page.goto(MOCK_URL, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForLoadState("networkidle");

    await page.locator("#ma-grid").locator(".ma-grid__cell").first().waitFor();

    const monthLabels = page
      .locator("#ma-grid")
      .locator(".ma-grid__month-label");

    const count = await monthLabels.count();
    expect(count).toBeGreaterThan(0);

    const positions = await monthLabels.evaluateAll((labels) =>
      labels.map((label) => {
        const rect = label.getBoundingClientRect();
        return {
          left: rect.left,
          right: rect.right,
          width: rect.width,
          text: label.textContent || "",
        };
      })
    );

    for (let i = 0; i < positions.length - 1; i++) {
      const current = positions[i];
      const next = positions[i + 1];

      expect(current.right).toBeLessThanOrEqual(next.left);
    }

    const monthTexts = positions.map((p) => p.text);
    const hasJan = monthTexts.includes("Jan");
    const firstMonth = monthTexts[0];

    if (hasJan) {
      expect(firstMonth).not.toBe("Dec");
    }
  });
});
