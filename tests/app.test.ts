import type { CalendarData, CalendarResponse, DataSource } from "@/utils/types";
import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { Window } from "happy-dom";

const calendarModule = new URL("../src/components/Calendar.ts", import.meta.url)
  .href;
const settingsModule = new URL("../src/utils/settings.ts", import.meta.url)
  .href;

const getStatsVisibilityMock = mock(() =>
  Promise.resolve({
    currentStreak: true,
    longestStreak: true,
    avgXP: true,
    maxXP: true,
  })
);
const getXpThresholdsMock = mock(() =>
  Promise.resolve({
    medium: 15,
    high: 30,
  })
);
const calendarMock = mock((data: CalendarData) => {
  const el = document.createElement("div");
  el.className = "calendar";
  el.textContent = `calendar-${data.stats.activeDays}`;
  return el;
});

mock.module(calendarModule, () => ({
  Calendar: calendarMock,
}));
mock.module(settingsModule, () => ({
  getStatsVisibility: getStatsVisibilityMock,
  getXpThresholds: getXpThresholdsMock,
}));

const { App } = await import("@/components/App");
mock.restore();

const buildResponse = (
  activeDays: number,
  status: CalendarResponse["status"] = "fresh"
): CalendarResponse => ({
  data: {
    grid: [],
    stats: {
      activeDays,
      totalDays: 365,
      streak: activeDays,
      longestStreak: activeDays,
      maxXP: activeDays * 10,
      avgXP: activeDays * 10,
    },
  },
  status,
});

describe("App", () => {
  let windowInstance: Window;

  beforeEach(() => {
    windowInstance = new Window();
    globalThis.window = windowInstance as unknown as typeof globalThis.window;
    globalThis.document =
      windowInstance.document as unknown as typeof globalThis.document;
    globalThis.HTMLElement =
      windowInstance.HTMLElement as unknown as typeof globalThis.HTMLElement;
  });

  afterEach(() => {
    mock.clearAllMocks();
  });

  it("renders calendar using the initial fetched response", async () => {
    const dataSource: DataSource = {
      fetchData: () => Promise.resolve(buildResponse(1)),
    };

    const app = App("default", dataSource);
    document.body.appendChild(app);

    await Promise.resolve();
    await Promise.resolve();

    expect(document.body.textContent).toContain("calendar-1");
  });
});
