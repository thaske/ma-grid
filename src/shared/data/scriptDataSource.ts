import type { DataSource } from "@/shared/data/dataSource";
import { buildCalendarData } from "@/shared/utils/aggregation";
import { fetchAllActivities } from "@/shared/utils/api";
import { isCacheFresh, readCache } from "@/shared/utils/cache";
import { logger } from "@/shared/utils/logger";
import type { CalendarResponse } from "@/types";

export class ScriptDataSource implements DataSource {
  private updateCallback: ((response: CalendarResponse) => void) | null = null;

  onUpdate(callback: (response: CalendarResponse) => void): void {
    this.updateCallback = callback;
  }

  async fetchData(): Promise<CalendarResponse> {
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

        void this.backgroundRefresh();

        return { data: staleData, isStale: true };
      }

      logger.log("Cache empty, fetching fresh data...");
      const activities = await fetchAllActivities(window.location.origin);
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

  private async backgroundRefresh() {
    try {
      logger.log("Starting background refresh...");
      const activities = await fetchAllActivities(window.location.origin);
      const freshData = buildCalendarData(activities);

      logger.log("Background refresh complete");

      if (this.updateCallback) {
        this.updateCallback({
          data: freshData,
          isFresh: true,
        });
      }
    } catch (error) {
      logger.error("Background refresh failed:", error);
    }
  }
}
