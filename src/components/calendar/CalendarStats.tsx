import type { CalendarStats } from "@/types";

export interface CalendarStatsProps {
  stats: CalendarStats;
}

export function CalendarStats({ stats }: CalendarStatsProps) {
  const statItems = [
    { value: stats.streak, label: "Current Streak" },
    { value: stats.avgXP, label: "Avg Daily XP" },
    { value: stats.maxXP, label: "Max Daily XP" },
  ];

  return (
    <div className="ma-grid__stats">
      {statItems.map((item) => (
        <div className="ma-grid__stat">
          <div className="ma-grid__stat-value">{String(item.value)}</div>
          <div className="ma-grid__stat-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
