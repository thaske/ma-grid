import { TASKS_PAGE_SIZE } from "../constants";

type MockTask = {
  id: number;
  completed: string;
  [key: string]: unknown;
};

export const parseCursorMs = (raw: string | undefined) => {
  if (!raw) return Date.now();
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }
  const parsed = Date.parse(decoded);
  return Number.isFinite(parsed) ? parsed : Date.now();
};

export const paginateTasks = (tasks: MockTask[], cursorMs: number) => {
  if (tasks.length === 0) return [];

  const sorted = [...tasks].sort((a, b) => {
    const ta = Date.parse(a.completed);
    const tb = Date.parse(b.completed);
    return (
      (Number.isFinite(tb) ? tb : -Infinity) -
      (Number.isFinite(ta) ? ta : -Infinity)
    );
  });

  const minCompletedMs = Math.min(
    ...sorted.map((task) => Date.parse(task.completed)).filter(Number.isFinite)
  );

  const lastPageStart =
    sorted.length === 0
      ? 0
      : Math.floor((sorted.length - 1) / TASKS_PAGE_SIZE) * TASKS_PAGE_SIZE;
  const lastPage = sorted.slice(lastPageStart);

  if (cursorMs <= minCompletedMs) {
    return lastPage;
  }

  const page = sorted.filter((task) => {
    const completedMs = Date.parse(task.completed);
    return Number.isFinite(completedMs) && completedMs <= cursorMs;
  });

  return page.slice(0, TASKS_PAGE_SIZE);
};
