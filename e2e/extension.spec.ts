import { expect, test } from "./fixtures";
import { MOCK_URL } from "./constants";

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
});
