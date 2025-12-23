const LOCAL_TIMEZONE =
  Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

const DATE_KEY_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: LOCAL_TIMEZONE,
});

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: LOCAL_TIMEZONE,
  weekday: "short",
});

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const formatDateKey = (date: Date): string =>
  DATE_KEY_FORMATTER.format(date);

// Parse YYYY-MM-DD as local date (avoids UTC interpretation issues)
export function parseDateKey(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export const getLocalWeekdayIndex = (date: Date): number => {
  const dayName = WEEKDAY_FORMATTER.format(date);
  const index = DAYS.indexOf(dayName);
  return index === -1 ? date.getDay() : index;
};
