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

const buildStreak = (length: number, endOffsetDays: number): Activity[] => {
  const endDate = new Date();
  endDate.setHours(12, 0, 0, 0);
  endDate.setDate(endDate.getDate() + endOffsetDays);
  return Array.from({ length }, (_, index) => {
    const date = new Date(endDate);
    date.setDate(date.getDate() - index);
    return buildActivity({
      id: index + 1,
      completed: date.toISOString(),
      started: date.toISOString(),
    });
  });
};

describe("buildCalendarData", () => {
  it("sums elapsed task time by completion date for the grid tooltip", () => {
    const completed = new Date();
    completed.setHours(12, 30, 0, 0);
    const earlier = new Date(completed);
    earlier.setMinutes(earlier.getMinutes() - 10);
    const data = buildCalendarData([
      buildActivity({
        id: 1,
        started: earlier.toISOString(),
        completed: completed.toISOString(),
      }),
      buildActivity({
        id: 2,
        started: earlier.toISOString(),
        completed: completed.toISOString(),
      }),
    ]);
    const day = data.grid
      .flat()
      .find((entry) => entry.date === formatDateKey(completed));
    expect(day?.elapsedMs).toBe(20 * 60 * 1000);
  });

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

  it("counts a completed longest streak beyond the visible year", () => {
    const activities = buildStreak(500, -5);
    const currentPage = buildCalendarData(activities);
    const olderPage = buildCalendarData(activities, { pageIndex: 1 });

    expect(currentPage.stats.longestStreak).toBe(500);
    expect(currentPage.stats.streak).toBe(0);
    expect(olderPage.stats).toEqual(currentPage.stats);
  });

  it("finds the longest streak entirely before the visible year", () => {
    const data = buildCalendarData(buildStreak(400, -400));

    expect(data.stats.longestStreak).toBe(400);
    expect(data.stats.activeDays).toBe(0);
  });

  it("excludes a current streak longer than a year from longest streak", () => {
    const data = buildCalendarData([
      ...buildStreak(500, 0),
      ...buildStreak(30, -502),
    ]);

    expect(data.stats.streak).toBe(500);
    expect(data.stats.longestStreak).toBe(30);
  });

  it("excludes a long current streak when today has no XP yet", () => {
    const data = buildCalendarData(buildStreak(400, -1));

    expect(data.stats.streak).toBe(400);
    expect(data.stats.longestStreak).toBe(0);
  });

  it("keeps a longer completed streak when the current streak exceeds a year", () => {
    const data = buildCalendarData([
      ...buildStreak(400, 0),
      ...buildStreak(500, -402),
    ]);

    expect(data.stats.streak).toBe(400);
    expect(data.stats.longestStreak).toBe(500);
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
    const utcDate = new Date();
    utcDate.setUTCHours(23, 30, 0, 0);
    const completed = utcDate.toISOString();
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

  it("can build older grid pages", () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const older = new Date(today);
    older.setDate(older.getDate() - 400);

    const activity = buildActivity({
      completed: older.toISOString(),
      started: older.toISOString(),
      pointsAwarded: 40,
    });

    const currentPage = buildCalendarData([activity]);
    const olderPage = buildCalendarData([activity], { pageIndex: 1 });
    const olderKey = formatDateKey(older);

    expect(currentPage.page?.hasPrevious).toBe(true);
    expect(olderPage.page?.hasNext).toBe(true);
    expect(
      olderPage.grid.flat().find((item) => item.date === olderKey)?.xp
    ).toBe(40);
  });

  it("keeps stats stable across grid pages", () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const current = new Date(today);
    current.setDate(current.getDate() - 5);
    const older = new Date(today);
    older.setDate(older.getDate() - 400);

    const activities = [
      buildActivity({
        id: 1,
        completed: current.toISOString(),
        started: current.toISOString(),
        pointsAwarded: 10,
      }),
      buildActivity({
        id: 2,
        completed: older.toISOString(),
        started: older.toISOString(),
        pointsAwarded: 100,
      }),
    ];

    const currentPage = buildCalendarData(activities);
    const olderPage = buildCalendarData(activities, { pageIndex: 1 });

    expect(olderPage.stats).toEqual(currentPage.stats);
  });

  it("uses smaller page jumps for sidebar-sized pages", () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const older = new Date(today);
    older.setDate(older.getDate() - 25 * 7);

    const activity = buildActivity({
      completed: older.toISOString(),
      started: older.toISOString(),
      pointsAwarded: 30,
    });

    const olderPage = buildCalendarData([activity], {
      pageIndex: 1,
      weeksPerPage: 22,
    });
    const visibleCells = olderPage.grid.flatMap((row) => row.slice(-22));

    expect(
      visibleCells.find((item) => item.date === formatDateKey(older))?.xp
    ).toBe(30);
  });
});
