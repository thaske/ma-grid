const pad2 = (value: number) => String(value).padStart(2, "0");

export const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
};

export function parseCompletedDate(completed: string): Date | null {
  const completedMs = Date.parse(completed);
  if (!Number.isFinite(completedMs)) return null;
  return new Date(completedMs);
}

export function formatCursorParam(cursor: Date) {
  return encodeURIComponent(cursor.toString());
}

// Parse YYYY-MM-DD as local date (avoids UTC interpretation issues)
export function parseDateKey(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export const getLocalWeekdayIndex = (date: Date) => date.getDay();
