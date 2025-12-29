import type { CalendarResponse } from "../types";

/**
 * Abstraction for fetching calendar data and receiving updates.
 * This allows the same App component to work with both the browser extension
 * (using browser.runtime messaging) and userscript (using direct API calls).
 */
export interface DataSource {
  /**
   * Fetch calendar data. May return stale cached data.
   */
  fetchData(): Promise<CalendarResponse>;

  /**
   * Register a callback to be notified when fresh data is available.
   * Called with the fresh data when it's ready.
   */
  onUpdate(callback: (data: CalendarResponse) => void): void;

  /**
   * Clean up any listeners or resources.
   */
  cleanup?(): void;
}
