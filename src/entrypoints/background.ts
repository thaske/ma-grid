import { buildCalendarData } from "@/shared/utils/aggregation";
import { fetchAllActivities } from "@/shared/utils/api";
import { isCacheFresh, readCache } from "@/shared/utils/cache";
import { MATHACADEMY_MATCHES } from "@/shared/utils/constants";
import { logger } from "@/shared/utils/logger";
import type { CalendarResponse } from "@/types";

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

            if (isFresh && cached.length > 0) {
              logger.log(
                "Returning fresh cached data:",
                cached.length,
                "activities"
              );
              const calendarData = buildCalendarData(cached);
              sendResponse({ data: calendarData, isFresh: true });
              return;
            }

            if (!isFresh && cached.length > 0) {
              logger.log(
                "Returning stale cached data, refreshing in background..."
              );
              const staleData = buildCalendarData(cached);
              sendResponse({ data: staleData, isStale: true });

              void (async () => {
                try {
                  logger.log("Starting background refresh...");
                  const activities = await fetchAllActivities(url.origin);
                  const freshData = buildCalendarData(activities);

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
                        isFresh: true,
                      });
                    }
                  }
                } catch (error) {
                  logger.error("Background refresh failed:", error);
                }
              })();
              return;
            }

            logger.log("Cache empty, fetching fresh data...");
            const activities = await fetchAllActivities(url.origin);
            const calendarData = buildCalendarData(activities);

            logger.log("Calendar data built:", calendarData.stats);
            sendResponse({ data: calendarData, isFresh: true });
          } catch (error) {
            logger.error("Error:", error);
            sendResponse({
              error: error instanceof Error ? error.message : String(error),
            });
          }
        })();

        return true;
      }
    );

    logger.log("Service worker initialized");
  },
});
