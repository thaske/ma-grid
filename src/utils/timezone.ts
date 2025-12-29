export const LOCAL_TIMEZONE =
  Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

const DATE_KEY_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: LOCAL_TIMEZONE,
});

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: LOCAL_TIMEZONE,
  weekday: "short",
});

const PATH_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: LOCAL_TIMEZONE,
  weekday: "short",
  month: "short",
  day: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const TIMEZONE_NAME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: LOCAL_TIMEZONE,
  timeZoneName: "long",
});

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const formatDateKey = (date: Date) => DATE_KEY_FORMATTER.format(date);

export function formatCursorParam(cursor: Date) {
  const parts = PATH_FORMATTER.formatToParts(cursor);
  const tzParts = TIMEZONE_NAME_FORMATTER.formatToParts(cursor);
  const tzName =
    tzParts.find((part) => part.type === "timeZoneName")?.value ||
    LOCAL_TIMEZONE;

  const offsetMinutes = -cursor.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hours = String(Math.floor(abs / 60)).padStart(2, "0");
  const minutes = String(abs % 60).padStart(2, "0");
  const offset = `GMT${sign}${hours}${minutes}`;

  const partsByType = parts.reduce<Record<string, string>>((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
  const { weekday, month, day, year, hour, minute, second } = partsByType;

  return encodeURIComponent(
    `${weekday} ${month} ${day} ${year} ${hour}:${minute}:${second} ${offset} (${tzName})`
  );
}

// Parse YYYY-MM-DD as local date (avoids UTC interpretation issues)
export function parseDateKey(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export const getLocalWeekdayIndex = (date: Date) => {
  const dayName = WEEKDAY_FORMATTER.format(date);
  const index = DAYS.indexOf(dayName);
  return index === -1 ? date.getDay() : index;
};
