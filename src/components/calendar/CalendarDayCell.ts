import type { DailyXP } from "@/types";
import { createElement, getXpLevel } from "../shared/createElement";

export interface CalendarDayCellOptions {
  day: DailyXP;
  rowIndex: number;
  colIndex: number;
  onHover: (day: DailyXP, x: number, y: number) => void;
  onLeave: () => void;
}

export function createCalendarDayCell(
  options: CalendarDayCellOptions
): HTMLElement {
  const { day, rowIndex, colIndex, onHover, onLeave } = options;

  const level = getXpLevel(day.xp);
  const cell = createElement("div", [
    "ma-grid__cell",
    `ma-grid__cell--${level}`,
  ]);
  cell.style.gridRow = String(rowIndex + 1);
  cell.style.gridColumn = String(colIndex + 1);

  cell.addEventListener("mouseenter", (e) => {
    onHover(day, e.clientX, e.clientY);
  });

  cell.addEventListener("mousemove", (e) => {
    onHover(day, e.clientX, e.clientY);
  });

  cell.addEventListener("mouseleave", () => {
    onLeave();
  });

  return cell;
}
