import { buildCalendarData } from "@/utils/aggregation";
import { formatDateKey } from "@/utils/timezone";
import type { Activity } from "@/utils/types";
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
  it("excludes the current streak from longest streak", () => {
    const noonToday = new Date();
    noonToday.setHours(12, 0, 0, 0);

    const activityForOffset = (offsetDays: number, id: number): Activity => {
      const date = new Date(noonToday);
      date.setDate(date.getDate() + offsetDays);
      return buildActivity({
        id,
        completed: date.toISOString(),
        started: date.toISOString(),
        pointsAwarded: 10,
      });
    };

    const activities = [
      activityForOffset(0, 1),
      activityForOffset(-1, 2),
      activityForOffset(-2, 3),
      activityForOffset(-5, 4),
      activityForOffset(-6, 5),
    ];

    const data = buildCalendarData(activities);

    expect(data.stats.streak).toBe(3);
    expect(data.stats.longestStreak).toBe(2);
  });

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

  it("uses completed dates with local timezone", () => {
    const completed = "2025-09-30T23:30:00.000Z";
    const activity = buildActivity({
      completed,
      started: completed,
      pointsAwarded: 25,
    });

    const data = buildCalendarData([activity]);
    const expectedKey = formatDateKey(new Date(completed));
    const entry = data.grid.flat().find((item) => item.date === expectedKey);

    expect(entry).toBeDefined();
    expect(entry?.xp).toBe(25);
    expect(data.stats.activeDays).toBe(1);
  });
});
