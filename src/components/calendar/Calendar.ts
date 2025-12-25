import type { CalendarData } from "@/types";
import { CALENDAR_CONTAINER_ID } from "@/utils/constants";
import { createElement } from "../shared/createElement";
import { createCalendarGrid, type LayoutMetrics } from "./CalendarGrid";
import { createCalendarHeader } from "./CalendarHeader";
import { createCalendarLegend } from "./CalendarLegend";
import { createCalendarStats } from "./CalendarStats";
import { createCalendarTooltip } from "./CalendarTooltip";

export type CalendarLayout = "default" | "sidebar";

export interface CalendarOptions {
  data: CalendarData;
  layout: CalendarLayout;
  metrics: LayoutMetrics;
}

export function createCalendar(options: CalendarOptions): HTMLElement {
  const { data, layout, metrics } = options;

  const calendar = createElement("div", "ma-grid");
  calendar.id = CALENDAR_CONTAINER_ID;

  calendar.style.setProperty("--cell-size", `${metrics.cellSize}px`);
  calendar.style.setProperty("--cell-gap", `${metrics.cellGap}px`);
  calendar.style.setProperty("--label-width", `${metrics.labelWidth}px`);

  if (layout === "sidebar") {
    calendar.classList.add("ma-grid--sidebar");
  }

  const tooltip = createCalendarTooltip();

  const header = createCalendarHeader();
  const stats = createCalendarStats({ stats: data.stats });
  const grid = createCalendarGrid({
    grid: data.grid,
    metrics,
    onCellHover: tooltip.show,
    onCellLeave: tooltip.hide,
  });
  const legend = createCalendarLegend();

  calendar.appendChild(header);
  calendar.appendChild(stats);
  calendar.appendChild(grid);
  calendar.appendChild(legend);
  calendar.appendChild(tooltip.element);

  return calendar;
}
