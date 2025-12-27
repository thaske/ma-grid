import type { CalendarResponse } from "@/types";
import { buildCalendarData } from "@/utils/aggregation";
import { fetchAllActivities } from "@/utils/api";
import { isCacheFresh, readCache } from "@/utils/cache";
import { MATHACADEMY_MATCHES } from "@/utils/constants";
import { logger } from "@/utils/logger";

export default defineBackground({
  type: { chrome: "module" },
  main() {
    browser.runtime.onMessage.addListener(
      (
        _message,
        sender,
        sendResponse: (response: CalendarResponse) => void
      ) => {
        (async () => {
          try {
            const tabUrl = sender?.tab?.url;
            if (!tabUrl) return;
            const url = new URL(tabUrl);

            const isFresh = await isCacheFresh();
            const cached = await readCache();

            // Case 1: Fresh cache - return immediately
            if (isFresh && cached.length > 0) {
              logger.log(
                "[MA-Grid] Returning fresh cached data:",
                cached.length,
                "activities"
              );
              const calendarData = buildCalendarData(cached);
              sendResponse({ data: calendarData, isFresh: true });
              return;
            }

            // Case 2: Stale cache exists - return immediately and refresh in background
            if (!isFresh && cached.length > 0) {
              logger.log(
                "[MA-Grid] Returning stale cached data, refreshing in background..."
              );
              const staleData = buildCalendarData(cached);
              sendResponse({ data: staleData, isStale: true });

              // Trigger background refresh (fire-and-forget)
              void (async () => {
                try {
                  logger.log("[MA-Grid] Starting background refresh...");
                  const activities = await fetchAllActivities(url.origin);
                  const freshData = buildCalendarData(activities);

                  // Push fresh data to all /learn tabs
                  const tabs = await browser.tabs.query({
                    url: MATHACADEMY_MATCHES,
                  });

                  logger.log(
                    "[MA-Grid] Background refresh complete, updating",
                    tabs.length,
                    "tab(s)"
                  );

                  for (const tab of tabs) {
                    if (tab.id) {
                      browser.tabs.sendMessage(tab.id, {
                        type: "calendar_update",
                        data: freshData,
                        isFresh: true,
                      });
                    }
                  }
                } catch (error) {
                  logger.error("[MA-Grid] Background refresh failed:", error);
                }
              })();
              return;
            }

            // Case 3: No cache - fetch fresh data
            logger.log("[MA-Grid] Cache empty, fetching fresh data...");
            const activities = await fetchAllActivities(url.origin);
            const calendarData = buildCalendarData(activities);

            logger.log("[MA-Grid] Calendar data built:", calendarData.stats);
            sendResponse({ data: calendarData, isFresh: true });
          } catch (error) {
            logger.error("[MA-Grid] Error:", error);
            sendResponse({
              error: error instanceof Error ? error.message : String(error),
            });
          }
        })();

        // Return true to indicate async response
        return true;
      }
    );

    logger.log("[MA-Grid] Service worker initialized");
  },
});
