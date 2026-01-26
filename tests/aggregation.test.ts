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
  it("uses dateCompletedStr from API", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, "0");
    const day = String(yesterday.getDate()).padStart(2, "0");

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const dayOrdinal = (d: number) => {
      const j = d % 10;
      const k = d % 100;
      if (j === 1 && k !== 11) return `${d}st`;
      if (j === 2 && k !== 12) return `${d}nd`;
      if (j === 3 && k !== 13) return `${d}rd`;
      return `${d}th`;
    };
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const dateCompletedStr = `${dayNames[yesterday.getDay()]}, ${
      monthNames[yesterday.getMonth()]
    } ${dayOrdinal(yesterday.getDate())}, ${year}`;

    const activity = buildActivity({
      completed: yesterday.toISOString(),
      started: yesterday.toISOString(),
      dateCompletedStr,
      pointsAwarded: 15,
    });

    const data = buildCalendarData([activity]);
    const entry = data.grid
      .flat()
      .find((item) => item.date === `${year}-${month}-${day}`);

    expect(entry).toBeDefined();
    expect(entry?.xp).toBe(15);
  });

  it('handles "Today" in dateCompletedStr', () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    const activity = buildActivity({
      completed: today.toISOString(),
      started: today.toISOString(),
      dateCompletedStr: "Today",
      pointsAwarded: 20,
    });

    const data = buildCalendarData([activity]);
    const entry = data.grid
      .flat()
      .find((item) => item.date === `${year}-${month}-${day}`);

    expect(entry).toBeDefined();
    expect(entry?.xp).toBe(20);
  });
});
