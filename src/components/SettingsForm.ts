import { CACHE_KEY } from "@/utils/constants";
import { logger } from "@/utils/logger";
import {
  getHideXpFrame,
  getUiAnchor,
  HIDE_XP_FRAME_STORAGE_KEY,
  isUiAnchor,
  UI_ANCHOR_STORAGE_KEY,
} from "@/utils/settings";
import { storage } from "@/utils/storage";

export interface SettingsFormOptions {
  onChange?: () => void;
  idPrefix?: string;
}

export interface SettingsFormAPI {
  element: HTMLElement;
  initialize: () => Promise<void>;
}

export function SettingsForm(
  options: SettingsFormOptions = {}
): SettingsFormAPI {
  const idPrefix = options.idPrefix || "";
  const hideXpId = idPrefix ? `${idPrefix}-hide-xp` : "hide-xp-frame";
  const clearCacheId = idPrefix ? `${idPrefix}-clear-cache` : "clear-cache";

  const form = document.createElement("form");
  form.className = "popup__form";
  form.setAttribute("aria-label", "Calendar placement");

  form.innerHTML = `
    <fieldset class="popup__fieldset">
      <legend class="popup__legend">Placement</legend>
      <label class="popup__option">
        <input type="radio" name="anchor" value="incompleteTasks" />
        <span>Incomplete tasks</span>
      </label>
      <label class="popup__option">
        <input type="radio" name="anchor" value="sidebar" />
        <span>Sidebar</span>
      </label>
    </fieldset>
    <fieldset class="popup__fieldset">
      <legend class="popup__legend">Display</legend>
      <label class="popup__option">
        <input type="checkbox" id="${hideXpId}" />
        <span>Hide XP panel</span>
      </label>
    </fieldset>
    <fieldset class="popup__fieldset">
      <legend class="popup__legend">Debug</legend>
      <button class="popup__button" type="button" id="${clearCacheId}">
        Clear cache
      </button>
    </fieldset>
  `;

  const anchorInputs = Array.from(
    form.querySelectorAll<HTMLInputElement>('input[name="anchor"]')
  );
  const hideXpInput = form.querySelector<HTMLInputElement>(`#${hideXpId}`);
  const clearCacheButton = form.querySelector<HTMLButtonElement>(
    `#${clearCacheId}`
  );

  // Event listeners
  anchorInputs.forEach((input) => {
    input.addEventListener("change", async (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (target.name !== "anchor") return;
      if (!isUiAnchor(target.value)) return;

      await storage.setItem(UI_ANCHOR_STORAGE_KEY, target.value);
      options.onChange?.();
    });
  });

  if (hideXpInput) {
    hideXpInput.addEventListener("change", async () => {
      await storage.setItem(HIDE_XP_FRAME_STORAGE_KEY, hideXpInput.checked);
      options.onChange?.();
    });
  }

  if (clearCacheButton) {
    clearCacheButton.addEventListener("click", async () => {
      const originalText = clearCacheButton.textContent ?? "";
      clearCacheButton.disabled = true;
      clearCacheButton.textContent = "Clearing...";
      try {
        await storage.removeItem(CACHE_KEY);
      } catch (error) {
        logger.error("Failed to clear cache:", error);
      }
      clearCacheButton.textContent = "Cleared";
      window.setTimeout(() => {
        clearCacheButton.textContent = originalText;
        clearCacheButton.disabled = false;
      }, 1200);
      options.onChange?.();
    });
  }

  async function initialize() {
    try {
      const [anchor, hideXpFrame] = await Promise.all([
        getUiAnchor(),
        getHideXpFrame(),
      ]);

      anchorInputs.forEach((input) => {
        input.checked = input.value === anchor;
      });

      if (hideXpInput) {
        hideXpInput.checked = hideXpFrame;
      }
    } catch (error) {
      logger.error("Failed to initialize settings form:", error);
    }
  }

  return {
    element: form,
    initialize,
  };
}
