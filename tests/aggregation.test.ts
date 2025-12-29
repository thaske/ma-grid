import { buildCalendarData } from "@/utils/aggregation";
import { formatDateKey, parseDateCompletedStr } from "@/utils/timezone";
import type { Activity } from "@/types";
import { describe, expect, it } from "bun:test";

const buildActivity = (overrides: Partial<Activity>): Activity => ({
  id: 1,
  type: "task",
  pointsAwarded: 10,
  started: new Date().toISOString(),
  completed: new Date().toISOString(),
  test: { course: { name: null } },
  ...overrides,
});

describe("buildCalendarData", () => {
  it("skips activities with invalid completed dates", () => {
    const validCompleted = new Date();
    const validActivity = buildActivity({
      id: 1,
      completed: validCompleted.toISOString(),
      started: validCompleted.toISOString(),
      pointsAwarded: 10,
    });
    const invalidActivity = buildActivity({
      id: 2,
      completed: "not-a-date",
      started: "not-a-date",
      pointsAwarded: 50,
    });

    const data = buildCalendarData([validActivity, invalidActivity]);
    const expectedKey = formatDateKey(validCompleted);
    const day = data.grid.flat().find((entry) => entry.date === expectedKey);

    expect(day).toBeDefined();
    expect(day?.xp).toBe(10);
    expect(data.stats.activeDays).toBe(1);
  });

  it("uses dateCompletedStr when available", () => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - 3);
    const day = targetDate.getDate();
    const suffix =
      day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
          ? "nd"
          : day % 10 === 3 && day !== 13
            ? "rd"
            : "th";
    const weekday = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
    }).format(targetDate);
    const month = new Intl.DateTimeFormat("en-US", {
      month: "short",
    }).format(targetDate);
    const dateCompletedStr = `${weekday}, ${month} ${day}${suffix}, ${targetDate.getFullYear()}`;
    const expectedKey = parseDateCompletedStr(dateCompletedStr);

    const activity = buildActivity({
      completed: "not-a-date",
      started: "not-a-date",
      dateCompletedStr,
      pointsAwarded: 25,
    });

    const data = buildCalendarData([activity]);
    expect(expectedKey).not.toBeNull();
    const entry = data.grid.flat().find((item) => item.date === expectedKey);

    expect(entry).toBeDefined();
    expect(entry?.xp).toBe(25);
    expect(data.stats.activeDays).toBe(1);
  });
});
