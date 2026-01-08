export interface Activity {
  id: number;
  type: string;
  pointsAwarded: number;
  started: string;
  completed: string;
  dateCompletedStr?: string;
  timeCompletedStr?: string;
  test: {
    course: {
      name: string | null;
    };
  };
}

export interface CachePayload {
  items: Activity[];
  updatedAt: string;
}

export interface DailyXP {
  date: string; // YYYY-MM-DD
  xp: number;
  weekday: number; // 0 = Sunday, 6 = Saturday
}

export interface CalendarStats {
  activeDays: number;
  totalDays: number;
  streak: number;
  longestStreak: number;
  maxXP: number;
  avgXP: number;
}

export interface CalendarData {
  grid: DailyXP[][]; // 7 rows (days of week) x ~53 cols (weeks)
  stats: CalendarStats;
}

export interface CalendarResponse {
  data?: CalendarData;
  error?: string;
  status?: "fresh" | "stale" | "error";
}

export type DataSourceUpdate = (data: CalendarResponse) => void;

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

  /**
   * Cleanup any listeners/subscriptions.
   */
  cleanup(): void;
}
