import { CACHE_KEY } from "@/shared/constants";
import {
  HIDE_XP_FRAME_STORAGE_KEY,
  UI_ANCHOR_STORAGE_KEY,
  getHideXpFrame,
  getUiAnchor,
  isUiAnchor,
} from "@/shared/settings";

const selector = 'input[name="anchor"]';
const inputs = Array.from(
  document.querySelectorAll<HTMLInputElement>(selector)
);
const hideXpFrameInput =
  document.querySelector<HTMLInputElement>("#hide-xp-frame");
const clearCacheButton =
  document.querySelector<HTMLButtonElement>("#clear-cache");

inputs.forEach((input) => {
  input.addEventListener("change", async (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (target.name !== "anchor") return;

    if (!isUiAnchor(target.value)) return;
    await browser.storage.local.set({
      [UI_ANCHOR_STORAGE_KEY]: target.value,
    });
  });
});

if (hideXpFrameInput) {
  hideXpFrameInput.addEventListener("change", async () => {
    await browser.storage.local.set({
      [HIDE_XP_FRAME_STORAGE_KEY]: hideXpFrameInput.checked,
    });
  });
}

if (clearCacheButton) {
  clearCacheButton.addEventListener("click", async () => {
    const originalText = clearCacheButton.textContent ?? "";
    clearCacheButton.disabled = true;
    clearCacheButton.textContent = "Clearing...";
    try {
      await storage.removeItem(CACHE_KEY);
    } catch {}
    clearCacheButton.textContent = "Cleared";
    window.setTimeout(() => {
      clearCacheButton.textContent = originalText;
      clearCacheButton.disabled = false;
    }, 1200);
  });
}

void (async () => {
  const [current, hideXpFrame] = await Promise.all([
    getUiAnchor(),
    getHideXpFrame(),
  ]);
  inputs.forEach((input) => {
    input.checked = input.value === current;
  });
  if (hideXpFrameInput) {
    hideXpFrameInput.checked = hideXpFrame;
  }
})();
