import { CACHE_KEY } from "@/utils/constants";
import { logger } from "@/utils/logger";
import {
  DEFAULT_STATS_VISIBILITY,
  getHideXpFrame,
  getStatsVisibility,
  getUiAnchor,
  HIDE_XP_FRAME_STORAGE_KEY,
  isUiAnchor,
  STATS_VISIBILITY_STORAGE_KEY,
  UI_ANCHOR_STORAGE_KEY,
  type StatsVisibility,
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
  const statsCurrentStreakId = idPrefix
    ? `${idPrefix}-stat-current-streak`
    : "stat-current-streak";
  const statsLongestStreakId = idPrefix
    ? `${idPrefix}-stat-longest-streak`
    : "stat-longest-streak";
  const statsAvgXpId = idPrefix ? `${idPrefix}-stat-avg-xp` : "stat-avg-xp";
  const statsMaxXpId = idPrefix ? `${idPrefix}-stat-max-xp` : "stat-max-xp";

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
      <legend class="popup__legend">Stats</legend>
      <label class="popup__option">
        <input type="checkbox" id="${statsCurrentStreakId}" />
        <span>Current streak</span>
      </label>
      <label class="popup__option">
        <input type="checkbox" id="${statsLongestStreakId}" />
        <span>Longest streak</span>
      </label>
      <label class="popup__option">
        <input type="checkbox" id="${statsAvgXpId}" />
        <span>Avg daily XP</span>
      </label>
      <label class="popup__option">
        <input type="checkbox" id="${statsMaxXpId}" />
        <span>Max daily XP</span>
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
  const statsInputs = {
    currentStreak: form.querySelector<HTMLInputElement>(
      `#${statsCurrentStreakId}`
    ),
    longestStreak: form.querySelector<HTMLInputElement>(
      `#${statsLongestStreakId}`
    ),
    avgXP: form.querySelector<HTMLInputElement>(`#${statsAvgXpId}`),
    maxXP: form.querySelector<HTMLInputElement>(`#${statsMaxXpId}`),
  };

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

  const updateStatsVisibility = async () => {
    const visibility: StatsVisibility = {
      currentStreak:
        statsInputs.currentStreak?.checked ??
        DEFAULT_STATS_VISIBILITY.currentStreak,
      longestStreak:
        statsInputs.longestStreak?.checked ??
        DEFAULT_STATS_VISIBILITY.longestStreak,
      avgXP: statsInputs.avgXP?.checked ?? DEFAULT_STATS_VISIBILITY.avgXP,
      maxXP: statsInputs.maxXP?.checked ?? DEFAULT_STATS_VISIBILITY.maxXP,
    };

    await storage.setItem(STATS_VISIBILITY_STORAGE_KEY, visibility);
    options.onChange?.();
  };

  Object.values(statsInputs).forEach((input) => {
    if (!input) return;
    input.addEventListener("change", updateStatsVisibility);
  });

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
      const [anchor, hideXpFrame, statsVisibility] = await Promise.all([
        getUiAnchor(),
        getHideXpFrame(),
        getStatsVisibility(),
      ]);

      anchorInputs.forEach((input) => {
        input.checked = input.value === anchor;
      });

      if (hideXpInput) {
        hideXpInput.checked = hideXpFrame;
      }

      if (statsInputs.currentStreak) {
        statsInputs.currentStreak.checked = statsVisibility.currentStreak;
      }
      if (statsInputs.longestStreak) {
        statsInputs.longestStreak.checked = statsVisibility.longestStreak;
      }
      if (statsInputs.avgXP) {
        statsInputs.avgXP.checked = statsVisibility.avgXP;
      }
      if (statsInputs.maxXP) {
        statsInputs.maxXP.checked = statsVisibility.maxXP;
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
