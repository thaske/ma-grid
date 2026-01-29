import type { XpThresholds } from "@/utils/settings";
import type { DailyXP } from "@/utils/types";

export function DayCell(
  day: DailyXP,
  rowIndex: number,
  colIndex: number,
  onHover: (day: DailyXP, x: number, y: number) => void,
  onLeave: () => void,
  thresholds: XpThresholds
) {
  const level = getLevelFromXP(day.xp, thresholds);

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

function getLevelFromXP(xp: number, thresholds: XpThresholds) {
  if (xp === 0) return "none";
  else if (xp < thresholds.medium) return "low";
  else if (xp < thresholds.high) return "medium";
  else return "high";
}
