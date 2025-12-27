import type { DailyXP } from "@/types";
import { ReactElement } from "jsx-dom";

export interface TooltipController {
  element: ReactElement;
  show: (day: DailyXP, x: number, y: number) => void;
  hide: () => void;
}

export function CalendarTooltip(_props?: {}): TooltipController {
  const tooltip = (
    <div className="ma-grid__tooltip" style={{ display: "none" }} />
  );

  const show = (day: DailyXP, x: number, y: number) => {
    const xpText = day.xp === 0 ? "No activity" : `${day.xp} XP`;

    const [year, month, dayOfMonth] = day.date.split("-").map(Number);
    const date = new Date(year, month - 1, dayOfMonth);
    const dateText = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const content = (
      <>
        <div className="ma-grid__tooltip-date">{dateText}</div>
        <div className="ma-grid__tooltip-xp">{xpText}</div>
      </>
    );

    tooltip.replaceChildren(content);
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
