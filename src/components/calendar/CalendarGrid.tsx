import type { DailyXP } from "@/types";
import { CalendarDayCell } from "./CalendarDayCell";

export interface LayoutMetrics {
  cellSize: number;
  cellGap: number;
  labelWidth: number;
}

export interface CalendarGridProps {
  grid: DailyXP[][];
  metrics: LayoutMetrics;
  onCellHover: (day: DailyXP, x: number, y: number) => void;
  onCellLeave: () => void;
}

export function CalendarGrid({
  grid,
  metrics,
  onCellHover,
  onCellLeave,
}: CalendarGridProps) {
  // Calculate month positions
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

  return (
    <div class="ma-grid__wrapper">
      <div class="ma-grid__month-labels" style={{ position: "relative" }}>
        {monthPositions.map((month) => (
          <div
            class="ma-grid__month-label"
            style={{
              position: "absolute",
              left: `${month.colStart * cellWithGap}px`,
            }}
          >
            {month.label}
          </div>
        ))}
      </div>

      <div class="ma-grid__grid">
        <div class="ma-grid__weekday-labels">
          {["", "M", "", "W", "", "F", ""].map((label) => (
            <div class="ma-grid__weekday-label">{label}</div>
          ))}
        </div>

        <div class="ma-grid__days">
          {grid.map((weekRow, rowIdx) =>
            weekRow.map((dayData, colIdx) => (
              <CalendarDayCell
                day={dayData}
                rowIndex={rowIdx}
                colIndex={colIdx}
                onHover={onCellHover}
                onLeave={onCellLeave}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
