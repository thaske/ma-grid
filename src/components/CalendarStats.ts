import type { CalendarStats } from "@/utils/types";
import type { StatsVisibility } from "@/utils/settings";

export function Stats(stats: CalendarStats, visibility?: StatsVisibility) {
  const container = document.createElement("div");
  container.className = "ma-grid__stats";

  const statItems: Array<{
    key: keyof StatsVisibility;
    value: number;
    label: string;
  }> = [
    {
      key: "currentStreak",
      value: stats.streak,
      label: "Current Streak",
    },
    {
      key: "longestStreak",
      value: stats.longestStreak,
      label: "Longest Streak",
    },
    { key: "avgXP", value: stats.avgXP, label: "Avg Daily XP" },
    { key: "maxXP", value: stats.maxXP, label: "Max Daily XP" },
  ];

  statItems
    .filter((item) => visibility?.[item.key] ?? true)
    .forEach((item) => {
      const stat = document.createElement("div");
      stat.className = "ma-grid__stat";
      stat.innerHTML = `
      <div class="ma-grid__stat-value">${item.value}</div>
      <div class="ma-grid__stat-label">${item.label}</div>
    `;
      container.appendChild(stat);
    });

  return container;
}
