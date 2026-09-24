import { describe, expect, it, mock } from "bun:test";
import { createActivityStore } from "../src/utils/activityStore";
import type { Activity } from "../src/utils/types";

const activity = (id: number): Activity => ({
  id,
  type: "task",
  pointsAwarded: 10,
  started: "2026-09-23T09:00:00",
  completed: "2026-09-23T09:10:00",
  test: { course: { name: "Course" } },
});

const origin = "https://www.mathacademy.com";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe("activity store", () => {
  it("refreshes page-zero data without needing task-time requests", async () => {
    const load = mock(async () => [activity(1)]);
    const store = createActivityStore(load);
    expect(await store.getActivities(origin, true)).toEqual([activity(1)]);

    load.mockResolvedValue([activity(2), activity(1)]);
    // Historical pages reuse the snapshot, but opening the current page refreshes it.
    expect(await store.getActivities(origin)).toEqual([activity(1)]);
    expect(load).toHaveBeenCalledTimes(1);
    expect(await store.getActivities(origin, true)).toEqual([
      activity(2),
      activity(1),
    ]);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("shares an initial fetch between calendar and task-time requests", async () => {
    const pending = deferred<Activity[]>();
    const load = mock(() => pending.promise);
    const store = createActivityStore(load);
    const tasks = store.loadTaskTimes(origin, [1]);
    const calendar = store.getActivities(origin, true);

    pending.resolve([activity(1)]);
    expect(await tasks).toEqual([activity(1)]);
    expect(await calendar).toEqual([activity(1)]);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it.each(["tasks-first", "calendar-first"])(
    "shares fresh data with concurrent requests (%s)",
    async (order) => {
      const load = mock(async () => [activity(1)]);
      const store = createActivityStore(load);
      await store.getActivities(origin);
      const pending = deferred<Activity[]>();
      load.mockImplementation(() => pending.promise);

      let tasks: Promise<Activity[]>;
      let calendar: Promise<Activity[]>;
      if (order === "tasks-first") {
        tasks = store.loadTaskTimes(origin, [2]);
        // Let the task request start its refresh before the calendar arrives.
        await Promise.resolve();
        calendar = store.getActivities(origin, true);
      } else {
        calendar = store.getActivities(origin, true);
        tasks = store.loadTaskTimes(origin, [2]);
      }
      // Even historical-page requests should await the ongoing refresh.
      const historical = store.getActivities(origin);
      pending.resolve([activity(2), activity(1)]);

      expect(await tasks).toEqual([activity(2)]);
      expect(await calendar).toEqual([activity(2), activity(1)]);
      expect(await historical).toEqual([activity(2), activity(1)]);
      expect(load).toHaveBeenCalledTimes(2);
    }
  );

  it("retries a failed refresh without retaining a rejected promise", async () => {
    const load = mock(async () => [activity(1)]);
    const store = createActivityStore(load);
    await store.getActivities(origin);
    load.mockRejectedValueOnce(new Error("offline"));
    await expect(store.loadTaskTimes(origin, [2])).rejects.toThrow("offline");
    expect(await store.getActivities(origin)).toEqual([activity(1)]);

    load.mockResolvedValue([activity(2), activity(1)]);
    expect(await store.loadTaskTimes(origin, [2])).toEqual([activity(2)]);
    expect(load).toHaveBeenCalledTimes(3);
  });

  it("retries an initial fetch failure", async () => {
    const load = mock(async () => [activity(1)]);
    load.mockRejectedValueOnce(new Error("offline"));
    const store = createActivityStore(load);
    await expect(store.getActivities(origin, true)).rejects.toThrow("offline");
    expect(await store.getActivities(origin, true)).toEqual([activity(1)]);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("does not share snapshots between origins", async () => {
    const load = mock(async (url: string) => [
      activity(url === origin ? 1 : 2),
    ]);
    const store = createActivityStore(load);
    expect(await store.getActivities(origin)).toEqual([activity(1)]);
    expect(await store.getActivities("https://mathacademy.com")).toEqual([
      activity(2),
    ]);
    expect(await store.getActivities(origin)).toEqual([activity(1)]);
    expect(load).toHaveBeenCalledTimes(2);
  });
});
