import { getStatsVisibility, getXpThresholds } from "@/utils/settings";
import type { CalendarResponse, DataSource } from "@/utils/types";
import { Calendar } from "./Calendar";

const VISIBLE_WEEKS_BY_LAYOUT = {
  default: 53,
  sidebar: 22,
} as const;

export type AppElement = HTMLElement & {
  cleanup?: () => void;
};

export function App(
  layout: "sidebar" | "default",
  dataSource: DataSource,
  settingsButton?: HTMLElement
): AppElement {
  let mounted = true;
  let currentPageIndex = 0;
  const visibleWeeks = VISIBLE_WEEKS_BY_LAYOUT[layout];
  let hasRenderedCalendar = false;
  let requestId = 0;
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

  async function renderCalendar(
    response: CalendarResponse,
    activeRequestId: number
  ) {
    if (!mounted || activeRequestId !== requestId) return;

    if (response.error || !response.data) {
      setContainerState(
        "error",
        response.error || "No activity data available"
      );
      return;
    }

    const [statsVisibility, xpThresholds] = await settingsPromise;
    if (!mounted || activeRequestId !== requestId) return;

    currentPageIndex = response.data.page?.index ?? currentPageIndex;

    const calendar = Calendar(
      response.data,
      layout,
      settingsButton,
      statsVisibility,
      xpThresholds,
      {
        canGoPrevious: response.data.page?.hasPrevious ?? false,
        canGoNext: response.data.page?.hasNext ?? false,
        onPrevious: () => fetchData(currentPageIndex + 1),
        onNext: () => fetchData(Math.max(0, currentPageIndex - 1)),
      }
    );

    hasRenderedCalendar = true;
    container.className = "";
    container.replaceChildren(calendar);
  }

  async function fetchData(pageIndex = currentPageIndex) {
    const activeRequestId = ++requestId;

    try {
      if (!hasRenderedCalendar) {
        setContainerState("loading", "Loading activity...");
      }
      const response = await dataSource.fetchData(pageIndex, visibleWeeks);
      await renderCalendar(response, activeRequestId);
    } catch (err) {
      if (!mounted || activeRequestId !== requestId) return;
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
