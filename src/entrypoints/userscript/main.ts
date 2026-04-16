import type { AppElement } from "@/components/App";
import { SettingsButton } from "@/components/SettingsButton";
import { SettingsModal } from "@/components/SettingsModal";
import mainStyles from "@/entrypoints/content/style.css?raw";
import { buildCalendarData } from "@/utils/aggregation";
import { fetchAllActivities } from "@/utils/api";
import { readCache } from "@/utils/cache";
import {
  cleanupMountedApp,
  mountCalendarUI,
  updateXpFrameHidden,
} from "@/utils/mount";
import {
  getHideXpFrame,
  getStatsVisibility,
  getUiAnchor,
  getXpThresholds,
  type StatsVisibility,
} from "@/utils/settings";
import type { CalendarResponse, DataSource } from "@/utils/types";
import settingsStyles from "./style.css?raw";

(async function () {
  "use strict";

  const dataSource: DataSource = {
    fetchData: async (): Promise<CalendarResponse> => {
      const origin = window.location.origin;
      let errorMessage = "Failed to load activity data";

      try {
        const activities = await fetchAllActivities(origin);
        return {
          data: buildCalendarData(activities),
          status: "fresh",
        };
      } catch (error) {
        errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Fresh data fetch failed, trying cache fallback:", error);
      }

      try {
        const cached = await readCache();
        if (cached.length > 0) {
          return {
            data: buildCalendarData(cached),
          };
        }
      } catch (error) {
        console.error("Cache fallback failed:", error);
      }

      return {
        error: errorMessage,
        status: "error",
      };
    },
  };

  let hideXpFrame = await getHideXpFrame();
  let anchor = await getUiAnchor();
  let statsVisibility = await getStatsVisibility();
  let xpThresholds = await getXpThresholds();

  let currentHost: HTMLElement | null = null;
  let currentShadow: ShadowRoot | null = null;
  let currentApp: AppElement | null = null;

  function openSettings() {
    if (!currentShadow) return;

    const handleSettingsChange = async (): Promise<void> => {
      const previousAnchor = anchor;
      const previousStatsVisibility = statsVisibility;
      const previousXpThresholds = xpThresholds;
      hideXpFrame = await getHideXpFrame();
      anchor = await getUiAnchor();
      statsVisibility = await getStatsVisibility();
      xpThresholds = await getXpThresholds();

      updateXpFrameHidden(hideXpFrame);

      const statsVisibilityChanged = !areStatsVisibilityEqual(
        previousStatsVisibility,
        statsVisibility
      );
      const xpThresholdsChanged =
        previousXpThresholds.medium !== xpThresholds.medium ||
        previousXpThresholds.high !== xpThresholds.high;

      if (
        (previousAnchor !== anchor ||
          statsVisibilityChanged ||
          xpThresholdsChanged) &&
        currentShadow
      ) {
        const existingModal = currentShadow.querySelector(
          ".ma-grid-settings-modal"
        );
        if (existingModal) {
          existingModal.classList.add("ma-grid-fading-out");
          await new Promise((resolve) => setTimeout(resolve, 150));
        }

        mountUI();

        // Reopen settings in new shadow root with slight delay for smoother transition
        if (currentShadow) {
          await new Promise((resolve) => setTimeout(resolve, 50));
          const newModal = SettingsModal({
            onSettingsChange: handleSettingsChange,
          });
          currentShadow.appendChild(newModal);
        }
      }
    };

    const modal = SettingsModal({
      onSettingsChange: handleSettingsChange,
    });

    currentShadow.appendChild(modal);
  }

  function mountUI() {
    cleanupMountedApp(currentApp, currentHost);
    currentApp = null;
    currentHost = null;
    currentShadow = null;

    const settingsBtn = SettingsButton(openSettings);
    const mounted = mountCalendarUI({
      anchor,
      dataSource,
      settingsButton: settingsBtn,
      injectStyles: (shadow) => {
        const styleElem = document.createElement("style");
        styleElem.textContent = `${mainStyles}\n\n${settingsStyles}`;
        shadow.appendChild(styleElem);
      },
    });

    if (!mounted) return;

    currentHost = mounted.host;
    currentShadow = mounted.shadow;
    currentApp = mounted.app;
  }

  updateXpFrameHidden(hideXpFrame);
  mountUI();

  function areStatsVisibilityEqual(
    a: StatsVisibility,
    b: StatsVisibility
  ): boolean {
    return (
      a.currentStreak === b.currentStreak &&
      a.longestStreak === b.longestStreak &&
      a.avgXP === b.avgXP &&
      a.maxXP === b.maxXP
    );
  }
})();
