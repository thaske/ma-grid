import type { DailyXP } from "@/types";
import { createElement } from "../shared/createElement";
import { createCalendarDayCell } from "./CalendarDayCell";

export interface LayoutMetrics {
  cellSize: number;
  cellGap: number;
  labelWidth: number;
}

export interface CalendarGridOptions {
  grid: DailyXP[][];
  metrics: LayoutMetrics;
  onCellHover: (day: DailyXP, x: number, y: number) => void;
  onCellLeave: () => void;
}

export function createCalendarGrid(options: CalendarGridOptions): HTMLElement {
  const { grid, metrics, onCellHover, onCellLeave } = options;

  const wrapper = createElement("div", "ma-grid__wrapper");

  const monthLabels = createElement("div", "ma-grid__month-labels");
  if (grid.length !== 0 && grid[0].length !== 0) {
    let currentMonth: string | null = null;
    const monthPositions: { label: string; colStart: number }[] = [];

    grid[0].forEach((dayData, colIndex) => {
      const date = new Date(dayData.date + "T12:00:00");
      const monthName = date.toLocaleDateString("en-US", {
        month: "short",
      });

      if (monthName !== currentMonth) {
        monthPositions.push({
          label: monthName,
          colStart: colIndex,
        });
        currentMonth = monthName;
      }
    });

    const cellWithGap = metrics.cellSize + metrics.cellGap;

    monthPositions.forEach((month) => {
      const label = createElement("div", "ma-grid__month-label", month.label);
      label.style.position = "absolute";
      label.style.left = `${month.colStart * cellWithGap}px`;
      monthLabels.appendChild(label);
    });

    monthLabels.style.position = "relative";
  }
  wrapper.appendChild(monthLabels);

  const gridContainer = createElement("div", "ma-grid__grid");

  const weekdayLabels = createElement("div", "ma-grid__weekday-labels");
  ["", "M", "", "W", "", "F", ""].forEach((label) => {
    const labelEl = createElement("div", "ma-grid__weekday-label", label);
    weekdayLabels.appendChild(labelEl);
  });
  gridContainer.appendChild(weekdayLabels);

  const daysGrid = createElement("div", "ma-grid__days");

  grid.forEach((weekRow, rowIdx) => {
    weekRow.forEach((dayData, colIdx) => {
      const cell = createCalendarDayCell({
        day: dayData,
        rowIndex: rowIdx,
        colIndex: colIdx,
        onHover: onCellHover,
        onLeave: onCellLeave,
      });
      daysGrid.appendChild(cell);
    });
  });

  gridContainer.appendChild(daysGrid);
  wrapper.appendChild(gridContainer);

  return wrapper;
}
