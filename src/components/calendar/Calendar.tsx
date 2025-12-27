import type { CalendarData } from "@/types";
import { CALENDAR_CONTAINER_ID } from "@/utils/constants";
import { useRef, useEffect } from "preact/hooks";
import { CalendarGrid, type LayoutMetrics } from "./CalendarGrid";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarLegend } from "./CalendarLegend";
import { CalendarStats } from "./CalendarStats";
import { CalendarTooltip, type TooltipController } from "./CalendarTooltip";

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

export function Calendar(props: CalendarProps) {
  if (!props.data) throw new Error("No calendar data provided");

  const tooltipRef = useRef<TooltipController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize tooltip once
  if (!tooltipRef.current) {
    tooltipRef.current = CalendarTooltip();
  }

  // Append tooltip element to container
  useEffect(() => {
    if (containerRef.current && tooltipRef.current) {
      containerRef.current.appendChild(tooltipRef.current.element);
      return () => {
        tooltipRef.current?.element.remove();
      };
    }
  }, []);

  const grid = getGridForLayout(props.data.grid, props.layout);

  const resolvedMetrics = props.metrics ?? LAYOUT_METRICS[props.layout];
  const { cellSize, cellGap, labelWidth } = resolvedMetrics;

  const className =
    props.layout === "sidebar" ? "ma-grid ma-grid--sidebar" : "ma-grid";

  return (
    <div
      ref={containerRef}
      class={className}
      id={CALENDAR_CONTAINER_ID}
      style={{
        "--cell-size": `${cellSize}px`,
        "--cell-gap": `${cellGap}px`,
        "--label-width": `${labelWidth}px`,
      }}
    >
      <CalendarHeader />
      <CalendarStats stats={props.data.stats} />
      <CalendarGrid
        grid={grid}
        metrics={resolvedMetrics}
        onCellHover={tooltipRef.current.show}
        onCellLeave={tooltipRef.current.hide}
      />
      <CalendarLegend />
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
