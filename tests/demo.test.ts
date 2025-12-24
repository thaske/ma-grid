import type { CalendarData } from "@/types";
import { enhanceCalendarForDemo } from "@/utils/demo";
import { afterEach, describe, expect, it, spyOn } from "bun:test";

const buildCalendarData = (): CalendarData => ({
  grid: [
    [{ date: "2024-01-01", xp: 20, weekday: 1 }],
    [{ date: "2024-01-02", xp: 0, weekday: 2 }],
    [{ date: "2024-01-03", xp: 0, weekday: 3 }],
    [{ date: "2024-01-04", xp: 0, weekday: 4 }],
    [{ date: "2024-01-05", xp: 0, weekday: 5 }],
    [{ date: "2024-01-06", xp: 0, weekday: 6 }],
    [{ date: "2024-01-07", xp: 0, weekday: 0 }],
  ],
  stats: {
    activeDays: 1,
    totalDays: 7,
    streak: 1,
    maxXP: 20,
    avgXP: 20,
  },
});

describe("enhanceCalendarForDemo", () => {
  let randomSpy: ReturnType<typeof spyOn> | null = null;

  afterEach(() => {
    randomSpy?.mockRestore();
    randomSpy = null;
  });

  it("extends an active streak instead of ending immediately", () => {
    randomSpy = spyOn(Math, "random").mockReturnValue(0);

    const result = enhanceCalendarForDemo(buildCalendarData());

    expect(result.grid[1][0].xp).toBeGreaterThan(0);
  });
});
