import { getStatsVisibility, getXpThresholds } from "@/utils/settings";
import type { CalendarResponse, DataSource } from "@/utils/types";
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
  const settingsPromise = Promise.all([
    getStatsVisibility(),
    getXpThresholds(),
  ]);

  const container: AppElement = document.createElement("div");
  const setContainerState = (state: "loading" | "error", text: string) => {
    container.className = `ma-grid__${state}`;
    if (layout === "sidebar") {
      container.classList.add(`ma-grid__${state}--sidebar`);
    }
    container.textContent = text;
  };

  setContainerState("loading", "Loading activity...");

  async function renderCalendar(response: CalendarResponse) {
    if (!mounted) return;

    if (response.error || !response.data) {
      setContainerState(
        "error",
        response.error || "No activity data available"
      );
      return;
    }

    const [statsVisibility, xpThresholds] = await settingsPromise;
    if (!mounted) return;

    const calendar = Calendar(
      response.data,
      layout,
      settingsButton,
      statsVisibility,
      xpThresholds
    );

    container.parentNode?.replaceChild(calendar, container);
  }

  async function fetchData() {
    try {
      const response = await dataSource.fetchData();
      await renderCalendar(response);
    } catch (err) {
      if (!mounted) return;
      console.error("Failed to load calendar:", err);
      setContainerState(
        "error",
        err instanceof Error ? err.message : "Failed to load activity data"
      );
    }
  }

  container.cleanup = () => {
    mounted = false;
    dataSource.cleanup?.();
  };

  fetchData();

  return container;
}
