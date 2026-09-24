import { parseDateKey } from "@/utils/timezone";
import { formatTaskElapsed } from "@/utils/taskTimes";
import type { DailyXP } from "@/utils/types";

export interface TooltipController {
  element: HTMLElement;
  show: (day: DailyXP, x: number, y: number) => void;
  hide: () => void;
}

export function Tooltip(showTaskTimes = true) {
  const tooltip = document.createElement("div");
  tooltip.className = "ma-grid__tooltip";
  tooltip.style.display = "none";

  const show = (day: DailyXP, x: number, y: number) => {
    const xpText = day.xp === 0 ? "No activity" : `${day.xp} XP`;

    const date = parseDateKey(day.date);
    const dateText = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    tooltip.innerHTML = `
      <div class="ma-grid__tooltip-date">${dateText}</div>
      <div class="ma-grid__tooltip-xp">${xpText}</div>
    `;
    if (showTaskTimes && day.elapsedMs !== undefined) {
      const xpLine = tooltip.querySelector<HTMLElement>(
        ".ma-grid__tooltip-xp"
      )!;
      xpLine.textContent += ` · ${formatTaskElapsed(day.elapsedMs)}`;
      xpLine.title =
        "Wall-clock time for tasks completed that day (includes breaks)";
    }

    tooltip.style.display = "block";

    const offset = 10;
    const rect = tooltip.getBoundingClientRect();
    let left = x + offset;

    if (left + rect.width > window.innerWidth) {
      left = x - offset - rect.width;
    }

    tooltip.style.left = `${Math.max(0, left)}px`;
    tooltip.style.top = `${y + offset}px`;
  };

  const hide = () => {
    tooltip.style.display = "none";
  };

  return { element: tooltip, show, hide };
}
