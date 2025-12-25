const LEVELS = ["none", "low", "medium", "high"];

export function CalendarLegend(_props?: {}) {
  return (
    <div className="ma-grid__legend">
      <span className="ma-grid__legend-label">Less</span>
      {LEVELS.map((level) => (
        <div
          className={["ma-grid__legend-box", `ma-grid__legend-box--${level}`]}
        />
      ))}
      <span className="ma-grid__legend-label">More</span>
    </div>
  );
}
