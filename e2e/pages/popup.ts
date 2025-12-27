import { Locator, Page, expect } from "@playwright/test";

export class PopupPage {
  readonly page: Page;
  readonly extensionId: string;
  readonly root: Locator;
  readonly title: Locator;
  readonly settingsHeading: Locator;
  readonly anchorOptions: Locator;
  readonly hideXpToggle: Locator;
  readonly clearCacheButton: Locator;

  constructor(page: Page, extensionId: string) {
    this.page = page;
    this.extensionId = extensionId;
    this.root = page.locator("main.popup");
    this.title = page.locator(".popup__title");
    this.settingsHeading = page.locator("#settings-title");
    this.anchorOptions = page.locator('input[name="anchor"]');
    this.hideXpToggle = page.locator("#hide-xp-frame");
    this.clearCacheButton = page.locator("#clear-cache");
  }

  async open() {
    await this.page.goto(`chrome-extension://${this.extensionId}/popup.html`);
    await this.root.waitFor();
  }

  async selectAnchor(position: "incompleteTasks" | "sidebar") {
    const radio = this.page.locator(
      `input[name="anchor"][value="${position}"]`
    );
    await radio.waitFor({ state: "visible", timeout: 5000 });
    await radio.check();
  }

  async getAnchorValue() {
    const checked = this.anchorOptions.filter({
      has: this.page.locator(":checked"),
    });
    const value = await checked.getAttribute("value");
    return value || "";
  }

  async toggleHideXpFrame(shouldHide: boolean) {
    const isChecked = await this.isHideXpFrameChecked();
    if (isChecked !== shouldHide) {
      await this.hideXpToggle.check();
    }
  }

  async isHideXpFrameChecked() {
    return await this.hideXpToggle.isChecked();
  }

  async clickClearCache() {
    await this.clearCacheButton.click();
  }

  async waitForCacheCleared() {
    await expect(this.clearCacheButton).toHaveText("Cleared", {
      timeout: 5000,
    });
  }

  async getClearCacheButtonText() {
    return (await this.clearCacheButton.textContent()) || "";
  }
}
