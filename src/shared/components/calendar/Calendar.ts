import { CALENDAR_CONTAINER_ID } from "@/shared/utils/constants";
import type { CalendarData } from "@/types";
import { Grid, type LayoutMetrics } from "./CalendarGrid";
import { Header } from "./CalendarHeader";
import { Legend } from "./CalendarLegend";
import { Stats } from "./CalendarStats";
import { Tooltip } from "./CalendarTooltip";

export type CalendarLayout = "default" | "sidebar";

const LAYOUT_METRICS: Record<CalendarLayout, LayoutMetrics> = {
  default: { cellSize: 10, cellGap: 2, labelWidth: 12 },
  sidebar: { cellSize: 12, cellGap: 2, labelWidth: 12 },
};

const SIDEBAR_WEEKS = 22;

export function Calendar(
  data: CalendarData,
  layout: CalendarLayout,
  settingsButton?: HTMLElement
) {
  const grid = getGridForLayout(data.grid, layout);
  const metrics = LAYOUT_METRICS[layout];
  const { cellSize, cellGap, labelWidth } = metrics;

  const tooltip = Tooltip();

  const container = document.createElement("div");
  container.id = CALENDAR_CONTAINER_ID;
  container.className =
    layout === "sidebar" ? "ma-grid ma-grid--sidebar" : "ma-grid";
  container.style.setProperty("--cell-size", `${cellSize}px`);
  container.style.setProperty("--cell-gap", `${cellGap}px`);
  container.style.setProperty("--label-width", `${labelWidth}px`);

  container.appendChild(Header(settingsButton));
  container.appendChild(Stats(data.stats));
  container.appendChild(Grid(grid, metrics, tooltip.show, tooltip.hide));
  container.appendChild(Legend());
  container.appendChild(tooltip.element);

  return container;
}

function getGridForLayout(grid: CalendarData["grid"], layout: CalendarLayout) {
  if (layout !== "sidebar" || grid.length === 0) {
    return grid;
  }

  const columns = grid[0].length;
  if (columns <= SIDEBAR_WEEKS) {
    return grid;
  }

  return grid.map((row) => row.slice(-SIDEBAR_WEEKS));
}
