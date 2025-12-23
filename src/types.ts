export interface Activity {
  id: number;
  type: string;
  pointsAwarded: number;
  started: string;
  completed: string;
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
  maxXP: number;
  avgXP: number;
}

export interface CalendarData {
  grid: DailyXP[][]; // 7 rows (days of week) x ~53 cols (weeks)
  stats: CalendarStats;
}

export type MessageType = "GET_CALENDAR_DATA";

export interface Message {
  type: MessageType;
}

export interface CalendarResponse {
  data?: CalendarData;
  error?: string;
}
