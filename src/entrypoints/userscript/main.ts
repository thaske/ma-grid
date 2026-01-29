import type { AppElement } from "@/components/App";
import { SettingsButton } from "@/components/SettingsButton";
import { SettingsModal } from "@/components/SettingsModal";
import mainStyles from "@/entrypoints/content/style.css?raw";
import { buildCalendarData } from "@/utils/aggregation";
import { fetchAllActivities } from "@/utils/api";
import { isCacheFresh, readCache } from "@/utils/cache";
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
  type XpThresholds,
} from "@/utils/settings";
import type {
  CalendarResponse,
  DataSource,
  DataSourceUpdate,
} from "@/utils/types";
import settingsStyles from "./style.css?raw";

(async function () {
  "use strict";

  // Data source implementation for userscript
  function createDataSource(): DataSource {
    let updateCallback: DataSourceUpdate | null = null;
    let isRefreshing = false;

    const fetchData = async (): Promise<CalendarResponse> => {
      const origin = window.location.origin;

      try {
        const isFresh = await isCacheFresh();
        const cached = await readCache();

        if (isFresh && cached.length > 0) {
          console.log(
            "Returning fresh cached data:",
            cached.length,
            "activities"
          );
          const calendarData = buildCalendarData(cached);
          return { data: calendarData, status: "fresh" };
        }

        if (!isFresh && cached.length > 0) {
          console.log(
            "Returning stale cached data, refreshing in background..."
          );
          const staleData = buildCalendarData(cached);

          // Start background refresh
          if (!isRefreshing) {
            isRefreshing = true;
            (async () => {
              try {
                console.log("Starting background refresh...");
                const activities = await fetchAllActivities(origin);
                const freshData = buildCalendarData(activities);
                console.log("Background refresh complete");

                if (updateCallback) {
                  updateCallback({ data: freshData, status: "fresh" });
                }
              } catch (error) {
                console.error("Background refresh failed:", error);
              } finally {
                isRefreshing = false;
              }
            })();
          }

          return { data: staleData, status: "stale" };
        }

        console.log("Cache empty, fetching fresh data...");
        const activities = await fetchAllActivities(origin);
        const calendarData = buildCalendarData(activities);

        console.log("Calendar data built:", calendarData.stats);
        return { data: calendarData, status: "fresh" };
      } catch (error) {
        console.error("Error:", error);
        return {
          error: error instanceof Error ? error.message : String(error),
          status: "error",
        };
      }
    };

    return {
      fetchData,
      onUpdate(callback) {
        updateCallback = callback;
      },
      cleanup() {
        updateCallback = null;
        isRefreshing = false;
      },
    };
  }

  const dataSource = createDataSource();

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
