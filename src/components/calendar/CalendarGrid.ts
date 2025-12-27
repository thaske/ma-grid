import type { DailyXP } from "@/types";
import { DayCell } from "./CalendarDayCell";

export interface LayoutMetrics {
  cellSize: number;
  cellGap: number;
  labelWidth: number;
}

export function Grid(
  grid: DailyXP[][],
  metrics: LayoutMetrics,
  onCellHover: (day: DailyXP, x: number, y: number) => void,
  onCellLeave: () => void
): HTMLElement {
  let currentMonth: string | null = null;
  const monthPositions: { label: string; colStart: number }[] = [];

  if (grid.length !== 0 && grid[0].length !== 0) {
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
  }

  const cellWithGap = metrics.cellSize + metrics.cellGap;

  const wrapper = document.createElement("div");
  wrapper.className = "ma-grid__wrapper";

  const monthLabels = document.createElement("div");
  monthLabels.className = "ma-grid__month-labels";
  monthLabels.style.position = "relative";

  monthPositions.forEach((month) => {
    const label = document.createElement("div");
    label.className = "ma-grid__month-label";
    label.style.position = "absolute";
    label.style.left = `${month.colStart * cellWithGap}px`;
    label.textContent = month.label;
    monthLabels.appendChild(label);
  });

  const gridContainer = document.createElement("div");
  gridContainer.className = "ma-grid__grid";

  const weekdayLabels = document.createElement("div");
  weekdayLabels.className = "ma-grid__weekday-labels";

  ["", "M", "", "W", "", "F", ""].forEach((labelText) => {
    const label = document.createElement("div");
    label.className = "ma-grid__weekday-label";
    label.textContent = labelText;
    weekdayLabels.appendChild(label);
  });

  const daysContainer = document.createElement("div");
  daysContainer.className = "ma-grid__days";

  grid.forEach((weekRow, rowIdx) => {
    weekRow.forEach((dayData, colIdx) => {
      const cell = DayCell(dayData, rowIdx, colIdx, onCellHover, onCellLeave);
      daysContainer.appendChild(cell);
    });
  });

  gridContainer.appendChild(weekdayLabels);
  gridContainer.appendChild(daysContainer);

  wrapper.appendChild(monthLabels);
  wrapper.appendChild(gridContainer);

  return wrapper;
}
