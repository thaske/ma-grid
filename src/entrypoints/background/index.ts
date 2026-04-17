import { buildCalendarData } from "@/utils/aggregation";
import { fetchAllActivities } from "@/utils/api";
import { readCache } from "@/utils/cache";
import type { CalendarResponse } from "@/utils/types";
import { defineBackground } from "wxt/utils/define-background";

async function fetchCalendarResponse(
  origin: string
): Promise<CalendarResponse> {
  let errorMessage = "Failed to load activity data";

  try {
    const activities = await fetchAllActivities(origin);
    return {
      data: buildCalendarData(activities),
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
        data: buildCalendarData(cached),
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

    const response = await fetchCalendarResponse(new URL(tabUrl).origin);
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
      handleCalendarRequest(sender, sendResponse);
      return true;
    });

    console.log("Service worker initialized");
  },
});
