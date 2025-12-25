import type { CalendarStats } from "@/types";
import { createElement } from "../shared/createElement";

export interface CalendarStatsOptions {
  stats: CalendarStats;
}

export function createCalendarStats(
  options: CalendarStatsOptions
): HTMLElement {
  const { stats } = options;

  const statsBar = createElement("div", "ma-grid__stats");

  const statItems = [
    { value: stats.streak, label: "Current Streak" },
    { value: stats.avgXP, label: "Avg Daily XP" },
    { value: stats.maxXP, label: "Max Daily XP" },
  ];

  statItems.forEach((item) => {
    const statItem = createElement("div", "ma-grid__stat");

    const value = createElement(
      "div",
      "ma-grid__stat-value",
      String(item.value)
    );
    const label = createElement("div", "ma-grid__stat-label", item.label);

    statItem.appendChild(value);
    statItem.appendChild(label);
    statsBar.appendChild(statItem);
  });

  return statsBar;
}
