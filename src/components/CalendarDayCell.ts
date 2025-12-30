import { XP_THRESHOLDS } from "@/utils/constants";
import type { DailyXP } from "@/utils/types";

export function DayCell(
  day: DailyXP,
  rowIndex: number,
  colIndex: number,
  onHover: (day: DailyXP, x: number, y: number) => void,
  onLeave: () => void
) {
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

function getLevelFromXP(xp: number) {
  if (xp === 0) return "none";
  else if (xp < XP_THRESHOLDS.LOW) return "low";
  else if (xp < XP_THRESHOLDS.MEDIUM) return "medium";
  else return "high";
}
