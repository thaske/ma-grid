// GitHub-style green gradient for XP levels
export const XP_COLORS = {
  NONE: "#ebedf0",
  LOW: "#9be9a8",
  MEDIUM: "#40c463",
  HIGH: "#30a14e",
} as const;

export const CACHE_KEY = "local:maGridActivitiesCache";

export const MAX_PAGES = 200;
export const SLEEP_MS = 200;
export const OVERLAP_DAYS = 1000;

// Selector for injection point on MathAcademy dashboard

export const SELECTOR = {
  default: "#incompleteTasks",
  sidebar: "#sidebar",
};
export const CALENDAR_CONTAINER_ID = "ma-grid-calendar";

// URL patterns for MathAcademy learn page
const isLocal = ["development", "test"].includes(import.meta.env.MODE!);
export const MATHACADEMY_MATCHES = [
  "https://mathacademy.com/learn",
  "https://www.mathacademy.com/learn",
  ...(isLocal ? ["http://localhost:*/learn"] : []),
];
