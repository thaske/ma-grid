export const XP_COLORS = {
  NONE: "#ebedf0",
  LOW: "#9be9a8",
  MEDIUM: "#40c463",
  HIGH: "#30a14e",
} as const;

export const XP_THRESHOLDS = {
  LOW: 15,
  MEDIUM: 30,
} as const;

export const SECOND_MS = 1000;
export const DAY_MS = 24 * 60 * 60 * 1000;
export const THREE_YEARS_MS = 3 * 365 * DAY_MS;

export const CACHE_KEY = "maGridActivitiesCache";

export const MAX_PAGES = 200;
export const SLEEP_MS = 200;
export const OVERLAP_DAYS = 1000;

export const SELECTOR = {
  default: "#incompleteTasks",
  sidebar: "#sidebar",
};
export const CALENDAR_CONTAINER_ID = "ma-grid-calendar";

const isLocal = ["development", "test"].includes(import.meta.env.MODE!);
export const MATHACADEMY_MATCHES = [
  "https://mathacademy.com/learn",
  "https://www.mathacademy.com/learn",
  ...(isLocal ? ["http://localhost:*/learn"] : []),
];
