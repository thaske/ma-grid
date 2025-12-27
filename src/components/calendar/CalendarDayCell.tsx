import type { DailyXP } from "@/types";

export interface CalendarDayCellProps {
  day: DailyXP;
  rowIndex: number;
  colIndex: number;
  onHover: (day: DailyXP, x: number, y: number) => void;
  onLeave: () => void;
}

export function CalendarDayCell({
  day,
  rowIndex,
  colIndex,
  onHover,
  onLeave,
}: CalendarDayCellProps) {
  const level = getLevelFromXP(day.xp);
  return (
    <div
      class={`ma-grid__cell ma-grid__cell--${level}`}
      style={{
        gridRow: String(rowIndex + 1),
        gridColumn: String(colIndex + 1),
      }}
      onMouseEnter={(e) => onHover(day, e.clientX, e.clientY)}
      onMouseMove={(e) => onHover(day, e.clientX, e.clientY)}
      onMouseLeave={() => onLeave()}
    />
  );
}

function getLevelFromXP(xp: number): "none" | "low" | "medium" | "high" {
  if (xp === 0) return "none";
  else if (xp < 15) return "low";
  else if (xp < 30) return "medium";
  else return "high";
}
