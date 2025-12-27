import { CalendarResponse } from "@/types";
import { logger } from "@/utils/logger";
import { Calendar } from "./calendar/Calendar";

export function App(layout: "sidebar" | "default"): HTMLElement {
  const container = document.createElement("div");
  container.className = "ma-grid__loading";
  container.textContent = "Loading activity...";

  let mounted = true;

  async function fetchData() {
    try {
      const response = (await browser.runtime.sendMessage(
        {}
      )) as CalendarResponse;

      if (!mounted) return;

      if (response.error || !response.data) {
        container.className = "ma-grid__error";
        container.textContent = response.error || "No activity data available";
        return;
      }

      // Replace loading with calendar
      const calendar = Calendar(response.data, layout);
      container.parentNode?.replaceChild(calendar, container);

      // Listen for background refresh
      if (response.isStale) {
        const messageListener = (message: any) => {
          if (
            message.type === "calendar_update" &&
            message.isFresh &&
            message.data &&
            mounted
          ) {
            logger.log("[MA-Grid] Received fresh data, updating calendar");
            const newCalendar = Calendar(message.data, layout);
            calendar.parentNode?.replaceChild(newCalendar, calendar);
            browser.runtime.onMessage.removeListener(messageListener);
          }
        };
        browser.runtime.onMessage.addListener(messageListener);
      }
    } catch (err) {
      if (!mounted) return;
      logger.error("[MA-Grid] Failed to load calendar:", err);
      container.className = "ma-grid__error";
      container.textContent =
        err instanceof Error ? err.message : "Failed to load activity data";
    }
  }

  fetchData();

  return container;
}
