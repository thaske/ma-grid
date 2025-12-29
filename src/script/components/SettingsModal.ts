import { CACHE_KEY } from "@/shared/constants";
import {
  HIDE_XP_FRAME_STORAGE_KEY,
  UI_ANCHOR_STORAGE_KEY,
  type UiAnchor,
  isUiAnchor,
} from "@/shared/settings";
import { storage } from "../utils/storageAdapter";

export interface SettingsModalOptions {
  onSettingsChange: () => void;
}

export function SettingsModal(options: SettingsModalOptions): HTMLElement {
  const modal = document.createElement("div");
  modal.className = "ma-grid-settings-modal";

  modal.innerHTML = `
    <div class="ma-grid-settings-overlay">
      <div class="ma-grid-settings-panel">
        <main class="popup" aria-label="MA Grid settings">
          <header class="popup__header">
            <h1 class="popup__title">MA Grid</h1>
            <button class="ma-grid-settings-close" aria-label="Close settings">&times;</button>
          </header>

          <section class="popup__section" aria-labelledby="settings-title">
            <div class="popup__section-header">
              <h2 id="settings-title" class="popup__section-title">Settings</h2>
            </div>
            <div class="popup__card">
              <form class="popup__form" aria-label="Calendar placement">
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
                    <input type="checkbox" id="ma-grid-hide-xp" />
                    <span>Hide XP panel</span>
                  </label>
                </fieldset>
                <fieldset class="popup__fieldset">
                  <legend class="popup__legend">Debug</legend>
                  <button class="popup__button" type="button" id="ma-grid-clear-cache">
                    Clear cache
                  </button>
                </fieldset>
              </form>
            </div>
          </section>
        </main>
      </div>
    </div>
  `;

  const overlay = modal.querySelector(
    ".ma-grid-settings-overlay"
  ) as HTMLElement;
  const closeButton = modal.querySelector(
    ".ma-grid-settings-close"
  ) as HTMLButtonElement;
  const anchorInputs = Array.from(
    modal.querySelectorAll<HTMLInputElement>('input[name="anchor"]')
  );
  const hideXpInput = modal.querySelector<HTMLInputElement>("#ma-grid-hide-xp");
  const clearCacheButton = modal.querySelector<HTMLButtonElement>(
    "#ma-grid-clear-cache"
  );

  function close() {
    modal.remove();
  }

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      close();
    }
  });

  closeButton.addEventListener("click", close);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      close();
      document.removeEventListener("keydown", handleKeyDown);
    }
  };
  document.addEventListener("keydown", handleKeyDown);

  anchorInputs.forEach((input) => {
    input.addEventListener("change", async (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (target.name !== "anchor") return;
      if (!isUiAnchor(target.value)) return;

      await storage.setItem(UI_ANCHOR_STORAGE_KEY, target.value);
      options.onSettingsChange();
    });
  });

  if (hideXpInput) {
    hideXpInput.addEventListener("change", async () => {
      await storage.setItem(HIDE_XP_FRAME_STORAGE_KEY, hideXpInput.checked);
      options.onSettingsChange();
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
        console.error("[MA-Grid] Failed to clear cache:", error);
      }
      clearCacheButton.textContent = "Cleared";
      window.setTimeout(() => {
        clearCacheButton.textContent = originalText;
        clearCacheButton.disabled = false;
      }, 1200);
      options.onSettingsChange();
    });
  }

  void (async () => {
    const anchor =
      (await storage.getItem<UiAnchor>(UI_ANCHOR_STORAGE_KEY)) ??
      "incompleteTasks";
    const hideXpFrame =
      (await storage.getItem<boolean>(HIDE_XP_FRAME_STORAGE_KEY)) ?? false;

    anchorInputs.forEach((input) => {
      input.checked = input.value === anchor;
    });

    if (hideXpInput) {
      hideXpInput.checked = hideXpFrame;
    }
  })();

  return modal;
}
