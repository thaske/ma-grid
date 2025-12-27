import type { CalendarStats } from "@/types";

export function Stats(stats: CalendarStats): HTMLElement {
  const container = document.createElement("div");
  container.className = "ma-grid__stats";

  const statItems = [
    { value: stats.streak, label: "Current Streak" },
    { value: stats.avgXP, label: "Avg Daily XP" },
    { value: stats.maxXP, label: "Max Daily XP" },
  ];

  statItems.forEach((item) => {
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
