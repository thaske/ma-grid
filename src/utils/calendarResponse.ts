import { buildCalendarData } from "./aggregation";
import { fetchAllActivities } from "./api";
import { isCacheFresh, readCache } from "./cache";
import { logger } from "./logger";
import type { CalendarResponse } from "@/types";

type CalendarUpdateCallback = (
  response: CalendarResponse
) => void | Promise<void>;

interface CalendarResponseOptions {
  origin: string;
  onFresh?: CalendarUpdateCallback;
}

async function refreshInBackground(
  origin: string,
  onFresh: CalendarUpdateCallback
) {
  try {
    logger.log("Starting background refresh...");
    const activities = await fetchAllActivities(origin);
    const freshData = buildCalendarData(activities);
    logger.log("Background refresh complete");
    await onFresh({ data: freshData, isFresh: true });
  } catch (error) {
    logger.error("Background refresh failed:", error);
  }
}

export async function getCalendarResponse(
  options: CalendarResponseOptions
): Promise<CalendarResponse> {
  const { origin, onFresh } = options;

  try {
    const isFresh = await isCacheFresh();
    const cached = await readCache();

    if (isFresh && cached.length > 0) {
      logger.log("Returning fresh cached data:", cached.length, "activities");
      const calendarData = buildCalendarData(cached);
      return { data: calendarData, isFresh: true };
    }

    if (!isFresh && cached.length > 0) {
      logger.log("Returning stale cached data, refreshing in background...");
      const staleData = buildCalendarData(cached);

      if (onFresh) {
        void refreshInBackground(origin, onFresh);
      }

      return { data: staleData, isStale: true };
    }

    logger.log("Cache empty, fetching fresh data...");
    const activities = await fetchAllActivities(origin);
    const calendarData = buildCalendarData(activities);

    logger.log("Calendar data built:", calendarData.stats);
    return { data: calendarData, isFresh: true };
  } catch (error) {
    logger.error("Error:", error);
    return {
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
