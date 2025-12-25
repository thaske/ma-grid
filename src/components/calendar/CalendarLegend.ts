import { createElement } from "../shared/createElement";

export function createCalendarLegend(): HTMLElement {
  const legend = createElement("div", "ma-grid__legend");

  const lessLabel = createElement("span", "ma-grid__legend-label", "Less");
  legend.appendChild(lessLabel);

  const levels = ["none", "low", "medium", "high"];

  levels.forEach((level) => {
    const box = createElement("div", [
      "ma-grid__legend-box",
      `ma-grid__legend-box--${level}`,
    ]);
    legend.appendChild(box);
  });

  const moreLabel = createElement("span", "ma-grid__legend-label", "More");
  legend.appendChild(moreLabel);

  return legend;
}
