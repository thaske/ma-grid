import type { CalendarResponse } from "@/utils/types";

export type DataSourceUpdate = (data: CalendarResponse) => void;
export type DataSourceSubscribe = (emit: DataSourceUpdate) => () => void;

/**
 * Abstraction for fetching calendar data and receiving updates.
 * This allows the same App component to work with both the browser extension
 * (using browser.runtime messaging) and userscript (using direct API calls).
 */
export interface DataSource {
  /**
   * May return stale cached data.
   */
  fetchData(): Promise<CalendarResponse>;

  /**
   * Called with fresh data when it's ready.
   */
  onUpdate(callback: DataSourceUpdate): void;

  cleanup?(): void;
}

interface DataSourceOptions {
  fetchData: () => Promise<CalendarResponse>;
  subscribe?: DataSourceSubscribe;
}

export function createDataSource(options: DataSourceOptions): DataSource {
  let unsubscribe: (() => void) | null = null;
  let updateCallback: DataSourceUpdate | null = null;

  const cleanup = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    updateCallback = null;
  };

  return {
    fetchData: options.fetchData,
    onUpdate(callback) {
      updateCallback = callback;
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      if (options.subscribe) {
        unsubscribe = options.subscribe((data) => {
          updateCallback?.(data);
        });
      }
    },
    cleanup,
  };
}
