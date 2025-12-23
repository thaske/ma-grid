import { browser, defineBackground } from "#imports";
import type { CalendarResponse } from "@/types";
import { buildCalendarData } from "@/utils/aggregation";
import { fetchAllActivities } from "@/utils/api";
import { readCache } from "@/utils/cache";
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

            // First check cache for instant response
            const cached = await readCache();
            if (cached.length > 0) {
              logger.log(
                "[MA-Grid] Returning cached data:",
                cached.length,
                "activities"
              );
              const calendarData = buildCalendarData(cached);
              sendResponse({ data: calendarData });

              // Trigger background refresh (fire and forget)
              logger.log("[MA-Grid] Background refresh starting...");
              void fetchAllActivities(url.hostname)
                .then(() => logger.log("[MA-Grid] Background refresh complete"))
                .catch((error) =>
                  logger.error("[MA-Grid] Background refresh failed:", error)
                );
              return;
            }

            // No cache - need to fetch
            logger.log("[MA-Grid] No cache, fetching activities...");
            const activities = await fetchAllActivities(url.hostname);
            const calendarData = buildCalendarData(activities);

            logger.log("[MA-Grid] Calendar data built:", calendarData.stats);
            sendResponse({ data: calendarData });
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
