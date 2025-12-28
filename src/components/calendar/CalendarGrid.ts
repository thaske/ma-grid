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
) {
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

  let lastAddedLabel: HTMLDivElement | null = null;
  let lastAddedPosition = -1;

  monthPositions.forEach((month, index) => {
    const label = document.createElement("div");
    label.className = "ma-grid__month-label";
    label.style.position = "absolute";
    label.style.left = `${month.colStart * cellWithGap}px`;
    label.textContent = month.label;

    // Check for collision with previous month label
    if (lastAddedLabel && lastAddedPosition >= 0) {
      const minSpacing = 30; // Minimum pixels needed for a 3-letter month abbreviation
      const spacing = (month.colStart - lastAddedPosition) * cellWithGap;

      // If collision detected, remove the previous label and add the current one
      if (spacing < minSpacing) {
        monthLabels.removeChild(lastAddedLabel);
      }
    }

    monthLabels.appendChild(label);
    lastAddedLabel = label;
    lastAddedPosition = month.colStart;
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
