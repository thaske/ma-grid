import type { Activity, CachePayload } from "@/types";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from "bun:test";

const constantsModule = new URL("../src/utils/constants.ts", import.meta.url)
  .href;
const storageModule = new URL("../src/utils/storage.ts", import.meta.url).href;

mock.module(constantsModule, () => ({
  CACHE_KEY: "maGridActivitiesCache",
  MAX_PAGES: 2,
  SLEEP_MS: 0,
  OVERLAP_DAYS: 1000,
}));

const storageGetItemMock = mock<(key: string) => Promise<CachePayload | null>>(
  () => Promise.resolve(null)
);
const storageSetItemMock = mock<
  (key: string, value: CachePayload) => Promise<void>
>(() => Promise.resolve());
const storageRemoveItemMock = mock<(key: string) => Promise<void>>(() =>
  Promise.resolve()
);
const storageWatchMock = mock<
  (
    key: string,
    callback: (newValue: unknown, oldValue?: unknown) => void
  ) => () => void
>(() => () => {});

mock.module(storageModule, () => ({
  storage: {
    getItem: storageGetItemMock,
    setItem: storageSetItemMock,
    removeItem: storageRemoveItemMock,
    watch: storageWatchMock,
  },
}));

const { fetchAllActivities } = await import("@/utils/api");

const buildActivity = (id: number, completed: string): Activity => ({
  id,
  type: "task",
  pointsAwarded: 10,
  started: completed,
  completed,
  test: { course: { name: "Course" } },
});

describe("fetchAllActivities", () => {
  let fetchSpy: ReturnType<typeof spyOn> | null = null;

  beforeEach(() => {
    storageGetItemMock.mockResolvedValue(null);
    storageSetItemMock.mockResolvedValue();
  });

  afterEach(() => {
    fetchSpy?.mockRestore();
    fetchSpy = null;
    mock.clearAllMocks();
  });

  it("keeps new items from a page that also contains cached items", async () => {
    const now = new Date();
    const cachedActivity = buildActivity(1, now.toISOString());
    const newActivity = buildActivity(
      2,
      new Date(now.getTime() - 60 * 60 * 1000).toISOString()
    );

    storageGetItemMock.mockResolvedValue({
      items: [cachedActivity],
      updatedAt: now.toISOString(),
    });

    fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json([newActivity, cachedActivity])
    );

    const result = await fetchAllActivities("example.com");
    const ids = result.map((item) => item.id);

    expect(ids).toContain(2);
    expect(ids).toContain(1);
  });

  it("uses the oldest valid completed date when a page contains invalid dates", async () => {
    const now = Date.now();
    const validCompleted = new Date(now - 24 * 60 * 60 * 1000);
    const fallbackCompleted = new Date(now - 1000 * 24 * 60 * 60 * 1000);

    const page = [
      buildActivity(1, validCompleted.toISOString()),
      buildActivity(2, "not-a-date"),
    ];

    fetchSpy = spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(Response.json(page))
      .mockResolvedValueOnce(Response.json([]));

    await fetchAllActivities("example.com");

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    const secondUrl = String(fetchSpy.mock.calls[1][0]);
    const cursorParam = secondUrl.split("/").pop() ?? "";
    const decoded = decodeURIComponent(cursorParam);

    expect(decoded).toContain(String(validCompleted.getFullYear()));
    expect(decoded).not.toContain(String(fallbackCompleted.getFullYear()));
  });

  it("throws when the response is not ok", async () => {
    fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        statusText: "Unauthorized",
        headers: { "Content-Type": "application/json" },
      })
    );

    await expect(fetchAllActivities("example.com")).rejects.toThrow(
      /Request failed: 401/
    );
  });

  it("throws when the response JSON is not an array", async () => {
    fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ message: "not-an-array" })
    );

    await expect(fetchAllActivities("example.com")).rejects.toThrow(
      /Unexpected response: expected an array/
    );
  });

  it("stops immediately when receiving an empty page", async () => {
    const now = new Date();
    const activity1 = buildActivity(1, now.toISOString());
    const activity2 = buildActivity(
      2,
      new Date(now.getTime() - 60 * 60 * 1000).toISOString()
    );

    fetchSpy = spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(Response.json([activity1, activity2]))
      .mockResolvedValueOnce(Response.json([]));

    const result = await fetchAllActivities("example.com");

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(2);
    expect(result.map((a) => a.id)).toEqual([1, 2]);
  });

  it("stops on first empty page without making additional API calls", async () => {
    fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(Response.json([]));

    const result = await fetchAllActivities("example.com");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(result).toHaveLength(0);
  });

  it("does not move cursor backward by OVERLAP_DAYS on empty page", async () => {
    const now = new Date();
    const activityTime = new Date(now.getTime() - 60 * 60 * 1000);
    const activity = buildActivity(1, activityTime.toISOString());

    fetchSpy = spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(Response.json([activity]))
      .mockResolvedValueOnce(Response.json([]));

    await fetchAllActivities("example.com");

    expect(fetchSpy).toHaveBeenCalledTimes(2);

    const firstUrl = String(fetchSpy.mock.calls[0][0]);
    const secondUrl = String(fetchSpy.mock.calls[1][0]);

    const firstCursor = decodeURIComponent(firstUrl.split("/").pop() ?? "");
    const secondCursor = decodeURIComponent(secondUrl.split("/").pop() ?? "");

    const firstDate = new Date(firstCursor);
    const secondDate = new Date(secondCursor);

    expect(firstDate.getTime()).toBeGreaterThan(secondDate.getTime());

    const timeDiffMs = firstDate.getTime() - secondDate.getTime();
    const oneHourMs = 60 * 60 * 1000;
    const tenDaysMs = 10 * 24 * 60 * 60 * 1000;

    expect(timeDiffMs).toBeGreaterThan(oneHourMs - 10);
    expect(timeDiffMs).toBeLessThan(tenDaysMs);
  });
});
