import { buildCalendarData } from "@/utils/aggregation";
import { fetchAllActivities } from "@/utils/api";
import { readCache } from "@/utils/cache";
import type { Activity, CalendarResponse } from "@/utils/types";
import { defineBackground } from "wxt/utils/define-background";

const activitiesByOrigin = new Map<string, Promise<Activity[]>>();
const refreshesByOrigin = new Map<string, Promise<Activity[]>>();

async function getActivities(origin: string) {
  let activitiesPromise = activitiesByOrigin.get(origin);
  if (!activitiesPromise) {
    activitiesPromise = fetchAllActivities(origin);
    activitiesByOrigin.set(origin, activitiesPromise);
  }

  try {
    return await activitiesPromise;
  } catch (error) {
    activitiesByOrigin.delete(origin);
    throw error;
  }
}

async function fetchCalendarResponse(
  origin: string,
  pageIndex = 0,
  weeksPerPage?: number
): Promise<CalendarResponse> {
  let errorMessage = "Failed to load activity data";

  try {
    const activities = await getActivities(origin);
    return {
      data: buildCalendarData(activities, { pageIndex, weeksPerPage }),
      status: "fresh",
    };
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Fresh data fetch failed, trying cache fallback:", error);
  }

  try {
    const cached = await readCache();
    if (cached.length > 0) {
      return {
        data: buildCalendarData(cached, { pageIndex, weeksPerPage }),
      };
    }
  } catch (error) {
    console.error("Cache fallback failed:", error);
  }

  return {
    error: errorMessage,
    status: "error",
  };
}

async function handleCalendarRequest(
  message: { pageIndex?: unknown; weeksPerPage?: unknown },
  sender: Browser.runtime.MessageSender,
  sendResponse: (response: CalendarResponse) => void
) {
  try {
    const tabUrl = sender?.tab?.url;
    if (!tabUrl) {
      sendResponse({
        error: "Unable to determine tab URL",
        status: "error",
      });
      return;
    }

    const response = await fetchCalendarResponse(
      new URL(tabUrl).origin,
      typeof message.pageIndex === "number" ? message.pageIndex : 0,
      typeof message.weeksPerPage === "number"
        ? message.weeksPerPage
        : undefined
    );
    sendResponse(response);
  } catch (error) {
    sendResponse({
      error: error instanceof Error ? error.message : String(error),
      status: "error",
    });
  }
}

export default defineBackground({
  type: { chrome: "module" },
  main() {
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message?.type === "task_times_request") {
        const tabUrl = sender?.tab?.url;
        const ids: unknown = message.ids;
        if (
          !tabUrl ||
          !Array.isArray(ids) ||
          !ids.every((id) => Number.isSafeInteger(id))
        ) {
          sendResponse([]);
        } else {
          const origin = new URL(tabUrl).origin;
          getActivities(origin)
            .then(async (activities) => {
              const wanted = new Set<number>(ids);
              const newest = activities.reduce(
                (max, task) => Math.max(max, task.id),
                0
              );
              if (ids.some((id: number) => id > newest)) {
                // Only a genuinely new task requires refreshing the shared cache.
                let refresh = refreshesByOrigin.get(origin);
                if (!refresh) {
                  refresh = fetchAllActivities(origin);
                  refreshesByOrigin.set(origin, refresh);
                  activitiesByOrigin.set(origin, refresh);
                  void refresh
                    .finally(() => refreshesByOrigin.delete(origin))
                    .catch(() => {});
                }
                activities = await refresh;
              }
              sendResponse(activities.filter((task) => wanted.has(task.id)));
            })
            .catch(() => sendResponse([]));
        }
      } else {
        handleCalendarRequest(message, sender, sendResponse);
      }
      return true;
    });

    console.log("Service worker initialized");
  },
});
