const pad2 = (value: number) => String(value).padStart(2, "0");

export const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
};

export function formatCursorParam(cursor: Date) {
  return encodeURIComponent(cursor.toString());
}

// Parse YYYY-MM-DD as local date (avoids UTC interpretation issues)
export function parseDateKey(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export const getLocalWeekdayIndex = (date: Date) => date.getDay();

// Parse dateCompletedStr from API (e.g., "Sun, Dec 7th, 2025" or "Today") to YYYY-MM-DD
export function parseDateCompletedStr(dateStr: string): string | null {
  if (!dateStr) return null;

  // Handle special case: "Today"
  if (dateStr === "Today") {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Format: "DayName, Month DayNumber(st/nd/rd/th), Year"
  // Example: "Sun, Dec 7th, 2025"
  const match = dateStr.match(/\w+,\s+(\w+)\s+(\d+)\w+,\s+(\d{4})/);
  if (!match) return null;

  const [, monthName, day, year] = match;
  const monthMap: Record<string, string> = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };

  const month = monthMap[monthName];
  if (!month) return null;

  const paddedDay = day.padStart(2, "0");
  return `${year}-${month}-${paddedDay}`;
}
