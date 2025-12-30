import { logger } from "@/utils/logger";
import type { DataSource } from "@/utils/types";
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
  const setContainerState = (state: "loading" | "error", text: string) => {
    container.className = `ma-grid__${state}`;
    if (layout === "sidebar") {
      container.classList.add(`ma-grid__${state}--sidebar`);
    }
    container.textContent = text;
  };

  setContainerState("loading", "Loading activity...");

  async function fetchData() {
    try {
      const response = await dataSource.fetchData();

      if (!mounted) return;

      if (response.error || !response.data) {
        setContainerState(
          "error",
          response.error || "No activity data available"
        );
        return;
      }

      const calendar = Calendar(response.data, layout, settingsButton);
      container.parentNode?.replaceChild(calendar, container);
      currentCalendar = calendar;

      if (response.status === "stale") {
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
      setContainerState(
        "error",
        err instanceof Error ? err.message : "Failed to load activity data"
      );
    }
  }

  container.cleanup = () => {
    mounted = false;
    currentCalendar = null;
    dataSource.cleanup();
  };

  fetchData();

  return container;
}
