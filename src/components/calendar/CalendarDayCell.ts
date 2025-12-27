import type { DailyXP } from "@/types";

export function DayCell(
  day: DailyXP,
  rowIndex: number,
  colIndex: number,
  onHover: (day: DailyXP, x: number, y: number) => void,
  onLeave: () => void
): HTMLElement {
  const level = getLevelFromXP(day.xp);

  const cell = document.createElement("div");
  cell.className = `ma-grid__cell ma-grid__cell--${level}`;
  cell.style.gridRow = String(rowIndex + 1);
  cell.style.gridColumn = String(colIndex + 1);

  cell.addEventListener("mouseenter", (e) =>
    onHover(day, e.clientX, e.clientY)
  );
  cell.addEventListener("mousemove", (e) => onHover(day, e.clientX, e.clientY));
  cell.addEventListener("mouseleave", () => onLeave());

  return cell;
}

function getLevelFromXP(xp: number): "none" | "low" | "medium" | "high" {
  if (xp === 0) return "none";
  else if (xp < 15) return "low";
  else if (xp < 30) return "medium";
  else return "high";
}
