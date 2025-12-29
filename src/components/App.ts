import type { DataSource } from "@/utils/dataSource";
import { logger } from "@/utils/logger";
import { Calendar } from "./Calendar";

export type AppElement = HTMLElement & {
  cleanup?: () => void;
};

export function App(
  layout: "sidebar" | "default",
  dataSource: DataSource,
  settingsButton?: HTMLElement
): AppElement {
  let mounted = true;
  let currentCalendar: HTMLElement | null = null;

  const container: AppElement = document.createElement("div");
  container.className = "ma-grid__loading";
  if (layout === "sidebar") {
    container.classList.add("ma-grid__loading--sidebar");
  }
  container.textContent = "Loading activity...";

  async function fetchData() {
    try {
      const response = await dataSource.fetchData();

      if (!mounted) return;

      if (response.error || !response.data) {
        container.className = "ma-grid__error";
        if (layout === "sidebar") {
          container.classList.add("ma-grid__error--sidebar");
        }
        container.textContent = response.error || "No activity data available";
        return;
      }

      const calendar = Calendar(response.data, layout, settingsButton);
      container.parentNode?.replaceChild(calendar, container);
      currentCalendar = calendar;

      if (response.isStale) {
        dataSource.onUpdate((freshResponse) => {
          if (freshResponse.data && mounted && currentCalendar) {
            logger.log("Received fresh data, updating calendar");
            const newCalendar = Calendar(
              freshResponse.data,
              layout,
              settingsButton
            );
            currentCalendar.parentNode?.replaceChild(
              newCalendar,
              currentCalendar
            );
            currentCalendar = newCalendar;
          }
        });
      }
    } catch (err) {
      if (!mounted) return;
      logger.error("Failed to load calendar:", err);
      container.className = "ma-grid__error";
      if (layout === "sidebar") {
        container.classList.add("ma-grid__error--sidebar");
      }
      container.textContent =
        err instanceof Error ? err.message : "Failed to load activity data";
    }
  }

  container.cleanup = () => {
    mounted = false;
    currentCalendar = null;
  };

  fetchData();

  return container;
}
