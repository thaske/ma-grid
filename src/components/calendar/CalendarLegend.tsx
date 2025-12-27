const LEVELS = ["none", "low", "medium", "high"];

export function CalendarLegend(_props?: {}) {
  return (
    <div class="ma-grid__legend">
      <span class="ma-grid__legend-label">Less</span>
      {LEVELS.map((level) => (
        <div
          class={["ma-grid__legend-box", `ma-grid__legend-box--${level}`]}
        />
      ))}
      <span class="ma-grid__legend-label">More</span>
    </div>
  );
}
