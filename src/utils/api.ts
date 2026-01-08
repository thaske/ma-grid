import type { Activity } from "@/utils/types";
import { readCache } from "./cache";
import {
  CACHE_KEY,
  DAY_MS,
  MAX_PAGES,
  OVERLAP_DAYS,
  SLEEP_MS,
  THREE_YEARS_MS,
} from "./constants";
import { storage } from "./storage";
import { formatCursorParam } from "./timezone";

type StopReason =
  | "cached_id"
  | "window_exceeded"
  | "cursor_stuck"
  | "empty_page";

type PaginationState = {
  cursor: Date;
  lastCursorMs: number;
  fresh: Activity[];
  stopReason?: StopReason;
};

export async function fetchAllActivities(origin: string) {
  console.log("Activity base URL:", `${origin}/api/previous-tasks/`);

  const cached = await readCache();
  if (cached.length > 0) {
    console.log("Loaded", cached.length, "cached activities.");
  }

  const windowEndMs = Date.now();
  const windowStartMs = windowEndMs - THREE_YEARS_MS;
  const windowStartDate = new Date(windowStartMs);

  const cacheIds = new Set<number>();
  for (const item of cached) {
    const id = item?.id;
    if (typeof id === "number") {
      cacheIds.add(id);
    }
  }

  console.log("Fetching activities since", windowStartDate.toISOString());

  let state: PaginationState = {
    cursor: new Date(windowEndMs),
    lastCursorMs: windowEndMs,
    fresh: [],
  };

  for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex++) {
    const cursorParam = formatCursorParam(state.cursor);
    const url = `${origin}/api/previous-tasks/${cursorParam}`;

    const response = await fetch(url, { credentials: "include" });
    if (!response.ok) {
      const statusText = response.statusText ? ` ${response.statusText}` : "";
      throw new Error(`Request failed: ${response.status}${statusText}`);
    }
    const page = await response.json();
    if (!Array.isArray(page)) {
      throw new Error("Unexpected response: expected an array");
    }

    console.log(`Page ${pageIndex + 1} size:`, page.length);

    if (page.length === 0) {
      state = {
        ...state,
        stopReason: "empty_page",
      };
    } else {
      const fresh = [...state.fresh];
      let cachedHit = false;
      let oldest = Infinity;

      for (const item of page) {
        const id = item?.id;
        if (typeof id === "number" && cacheIds.has(id)) {
          cachedHit = true;
        } else {
          fresh.push(item);
        }

        const t = Date.parse(item.completed);
        if (Number.isFinite(t)) {
          oldest = Math.min(oldest, t);
        }
      }

      if (cachedHit) {
        state = {
          ...state,
          fresh,
          stopReason: "cached_id",
        };
      } else {
        const next = Number.isFinite(oldest)
          ? new Date(oldest - 1)
          : new Date(state.cursor.getTime() - OVERLAP_DAYS * DAY_MS);

        if (next.getTime() === state.lastCursorMs) {
          state = {
            ...state,
            fresh,
            stopReason: "cursor_stuck",
          };
        } else if (next < windowStartDate) {
          state = {
            ...state,
            fresh,
            cursor: next,
            stopReason: "window_exceeded",
          };
        } else {
          state = {
            ...state,
            fresh,
            cursor: next,
            lastCursorMs: next.getTime(),
          };
        }
      }
    }

    if (state.stopReason) {
      if (state.stopReason === "cached_id") {
        console.log("Reached cached activity, stopping pagination.");
      } else if (state.stopReason === "cursor_stuck") {
        console.warn("Cursor did not move; ending pagination.");
      } else if (state.stopReason === "window_exceeded") {
        console.log("Cursor moved past window start; finishing.");
      } else if (state.stopReason === "empty_page") {
        console.log("Received empty page from API; stopping pagination.");
      }
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, SLEEP_MS));
  }

  const combined = [...state.fresh, ...cached];
  const byId = new Map<number, Activity>();
  const withoutId: Activity[] = [];

  for (const item of combined) {
    const id = item?.id;
    if (typeof id === "number") {
      if (!byId.has(id)) {
        byId.set(id, item);
      }
    } else {
      withoutId.push(item);
    }
  }

  const activities = [...byId.values(), ...withoutId].filter((item) => {
    const t = Date.parse(item.completed);
    return Number.isFinite(t) && t >= windowStartMs && t <= windowEndMs;
  });

  activities.sort((a, b) => {
    const ta = Date.parse(a.completed);
    const tb = Date.parse(b.completed);
    return (
      (Number.isFinite(tb) ? tb : -Infinity) -
      (Number.isFinite(ta) ? ta : -Infinity)
    );
  });

  await storage.setItem(CACHE_KEY, {
    items: activities,
    updatedAt: new Date().toISOString(),
  });

  console.log("Total activities after deduplication:", activities.length);
  return activities;
}
