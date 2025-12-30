import type { AppElement } from "@/components/App";
import { SettingsButton } from "@/components/SettingsButton";
import { SettingsModal } from "@/components/SettingsModal";
import mainStyles from "@/entrypoints/content/style.css?raw";
import { buildCalendarData } from "@/utils/aggregation";
import { fetchAllActivities } from "@/utils/api";
import { isCacheFresh, readCache } from "@/utils/cache";
import { logger } from "@/utils/logger";
import {
  cleanupMountedApp,
  mountCalendarUI,
  updateXpFrameHidden,
} from "@/utils/mount";
import { getHideXpFrame, getUiAnchor } from "@/utils/settings";
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
          logger.log(
            "Returning fresh cached data:",
            cached.length,
            "activities"
          );
          const calendarData = buildCalendarData(cached);
          return { data: calendarData, status: "fresh" };
        }

        if (!isFresh && cached.length > 0) {
          logger.log(
            "Returning stale cached data, refreshing in background..."
          );
          const staleData = buildCalendarData(cached);

          // Start background refresh
          if (!isRefreshing && updateCallback) {
            isRefreshing = true;
            (async () => {
              try {
                logger.log("Starting background refresh...");
                const activities = await fetchAllActivities(origin);
                const freshData = buildCalendarData(activities);
                logger.log("Background refresh complete");

                if (updateCallback) {
                  updateCallback({ data: freshData, status: "fresh" });
                }
              } catch (error) {
                logger.error("Background refresh failed:", error);
              } finally {
                isRefreshing = false;
              }
            })();
          }

          return { data: staleData, status: "stale" };
        }

        logger.log("Cache empty, fetching fresh data...");
        const activities = await fetchAllActivities(origin);
        const calendarData = buildCalendarData(activities);

        logger.log("Calendar data built:", calendarData.stats);
        return { data: calendarData, status: "fresh" };
      } catch (error) {
        logger.error("Error:", error);
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

  let currentHost: HTMLElement | null = null;
  let currentShadow: ShadowRoot | null = null;
  let currentApp: AppElement | null = null;

  function openSettings() {
    if (!currentShadow) return;

    const handleSettingsChange = async (): Promise<void> => {
      const previousAnchor = anchor;
      hideXpFrame = await getHideXpFrame();
      anchor = await getUiAnchor();

      updateXpFrameHidden(hideXpFrame);

      if (previousAnchor !== anchor && currentShadow) {
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
})();
