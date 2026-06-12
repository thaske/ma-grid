import { buildCalendarData } from "@/utils/aggregation";
import { fetchAllActivities } from "@/utils/api";
import { readCache } from "@/utils/cache";
import type { Activity, CalendarResponse } from "@/utils/types";
import { defineBackground } from "wxt/utils/define-background";

const activitiesByOrigin = new Map<string, Promise<Activity[]>>();

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
    const activitiesPromise =
      pageIndex <= 0 ? fetchAllActivities(origin) : getActivities(origin);
    if (pageIndex <= 0) {
      activitiesByOrigin.set(origin, activitiesPromise);
    }

    const activities = await activitiesPromise;
    return {
      data: buildCalendarData(activities, { pageIndex, weeksPerPage }),
      status: "fresh",
    };
  } catch (error) {
    if (pageIndex <= 0) {
      activitiesByOrigin.delete(origin);
    }
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
      handleCalendarRequest(message, sender, sendResponse);
      return true;
    });

    console.log("Service worker initialized");
  },
});
