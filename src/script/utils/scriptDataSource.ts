/**
 * Data manager for userscript
 * Ports the background service worker logic from background.ts
 */

import { buildCalendarData } from "@/shared/aggregation";
import { fetchAllActivities } from "@/shared/api";
import { isCacheFresh, readCache } from "@/shared/cache";
import type { DataSource } from "@/shared/dataSource";
import { logger } from "@/shared/logger";
import type { CalendarResponse } from "@/types";

export class ScriptDataSource implements DataSource {
  private updateCallback: ((response: CalendarResponse) => void) | null = null;

  /**
   * Register callback to be called when background refresh completes
   */
  onUpdate(callback: (response: CalendarResponse) => void): void {
    this.updateCallback = callback;
  }

  /**
   * Fetch calendar data from cache or API
   * Returns fresh data if cache is recent, stale data if cache exists but is old,
   * or fetches new data if cache is empty
   */
  async fetchData(): Promise<CalendarResponse> {
    try {
      const isFresh = await isCacheFresh();
      const cached = await readCache();

      if (isFresh && cached.length > 0) {
        logger.log(
          "[MA-Grid] Returning fresh cached data:",
          cached.length,
          "activities"
        );
        const calendarData = buildCalendarData(cached);
        return { data: calendarData, isFresh: true };
      }

      if (!isFresh && cached.length > 0) {
        logger.log(
          "[MA-Grid] Returning stale cached data, refreshing in background..."
        );
        const staleData = buildCalendarData(cached);

        // Start background refresh (don't await)
        void this.backgroundRefresh();

        return { data: staleData, isStale: true };
      }

      logger.log("[MA-Grid] Cache empty, fetching fresh data...");
      const activities = await fetchAllActivities(window.location.origin);
      const calendarData = buildCalendarData(activities);

      logger.log("[MA-Grid] Calendar data built:", calendarData.stats);
      return { data: calendarData, isFresh: true };
    } catch (error) {
      logger.error("[MA-Grid] Error:", error);
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Background refresh logic
   * Fetches fresh data and calls refresh callback if set
   */
  private async backgroundRefresh() {
    try {
      logger.log("[MA-Grid] Starting background refresh...");
      const activities = await fetchAllActivities(window.location.origin);
      const freshData = buildCalendarData(activities);

      logger.log("[MA-Grid] Background refresh complete");

      // Notify UI if callback is set
      if (this.updateCallback) {
        this.updateCallback({
          data: freshData,
          isFresh: true,
        });
      }
    } catch (error) {
      logger.error("[MA-Grid] Background refresh failed:", error);
    }
  }
}
