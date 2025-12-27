import type { CalendarData } from "@/types";
import { CALENDAR_CONTAINER_ID } from "@/utils/constants";
import { CalendarGrid, type LayoutMetrics } from "./CalendarGrid";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarLegend } from "./CalendarLegend";
import { CalendarStats } from "./CalendarStats";
import { CalendarTooltip } from "./CalendarTooltip";

export type CalendarLayout = "default" | "sidebar";

const LAYOUT_METRICS: Record<CalendarLayout, LayoutMetrics> = {
  default: { cellSize: 10, cellGap: 2, labelWidth: 12 },
  sidebar: { cellSize: 12, cellGap: 2, labelWidth: 12 },
};

const SIDEBAR_WEEKS = 22;

export interface CalendarProps {
  data: CalendarData;
  layout: CalendarLayout;
  metrics?: LayoutMetrics;
}

export function Calendar({ data, layout, metrics }: CalendarProps) {
  if (!data) throw new Error("No calendar data provided");

  const tooltip = CalendarTooltip();
  const grid = getGridForLayout(data.grid, layout);

  const classes = ["ma-grid"];
  if (layout === "sidebar") {
    classes.push("ma-grid--sidebar");
  }

  const resolvedMetrics = metrics ?? LAYOUT_METRICS[layout];
  const { cellSize, cellGap, labelWidth } = resolvedMetrics;
  const style = `
    --cell-size: ${cellSize}px;
    --cell-gap: ${cellGap}px;
    --label-width: ${labelWidth}px
  `;

  return (
    <div className={classes} id={CALENDAR_CONTAINER_ID} style={style}>
      <CalendarHeader />
      <CalendarStats stats={data.stats} />
      <CalendarGrid
        grid={grid}
        metrics={resolvedMetrics}
        onCellHover={tooltip.show}
        onCellLeave={tooltip.hide}
      />
      <CalendarLegend />
      {tooltip.element}
    </div>
  );
}

function getGridForLayout(
  grid: CalendarData["grid"],
  layout: CalendarLayout
): CalendarData["grid"] {
  if (layout !== "sidebar" || grid.length === 0) {
    return grid;
  }

  const columns = grid[0].length;
  if (columns <= SIDEBAR_WEEKS) {
    return grid;
  }

  return grid.map((row) => row.slice(-SIDEBAR_WEEKS));
}
