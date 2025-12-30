import { buildCalendarData } from "@/utils/aggregation";
import { fetchAllActivities } from "@/utils/api";
import { isCacheFresh, readCache } from "@/utils/cache";
import { MATHACADEMY_MATCHES } from "@/utils/constants";
import { logger } from "@/utils/logger";
import type { CalendarResponse } from "@/utils/types";
import { defineBackground } from "wxt/utils/define-background";

async function getCalendarData(origin: string): Promise<CalendarResponse> {
  try {
    const isFresh = await isCacheFresh();
    const cached = await readCache();

    if (isFresh && cached.length > 0) {
      logger.log("Returning fresh cached data:", cached.length, "activities");
      const calendarData = buildCalendarData(cached);
      return { data: calendarData, status: "fresh" };
    }

    if (!isFresh && cached.length > 0) {
      logger.log("Returning stale cached data, refreshing in background...");
      const staleData = buildCalendarData(cached);

      // Start background refresh
      (async () => {
        try {
          logger.log("Starting background refresh...");
          const activities = await fetchAllActivities(origin);
          const freshData = buildCalendarData(activities);
          logger.log("Background refresh complete");

          // Notify all tabs with fresh data
          const tabs = await browser.tabs.query({
            url: MATHACADEMY_MATCHES,
          });

          logger.log(
            "Background refresh complete, updating",
            tabs.length,
            "tab(s)"
          );

          for (const tab of tabs) {
            if (tab.id) {
              browser.tabs.sendMessage(tab.id, {
                type: "calendar_update",
                data: freshData,
                status: "fresh",
              });
            }
          }
        } catch (error) {
          logger.error("Background refresh failed:", error);
        }
      })();

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
}

async function handleCalendarRequest(
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: CalendarResponse) => void
) {
  try {
    const tabUrl = sender?.tab?.url;
    if (!tabUrl) return;
    const url = new URL(tabUrl);

    const response = await getCalendarData(url.origin);
    sendResponse(response);
  } catch (error) {
    logger.error("Error:", error);
    sendResponse({
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export default defineBackground({
  type: { chrome: "module" },
  main() {
    browser.runtime.onMessage.addListener((_message, sender, sendResponse) => {
      handleCalendarRequest(sender, sendResponse);
      return true;
    });

    logger.log("Service worker initialized");
  },
});
