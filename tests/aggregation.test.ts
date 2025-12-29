import { buildCalendarData } from "@/utils/aggregation";
import { formatDateKey } from "@/utils/timezone";
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
