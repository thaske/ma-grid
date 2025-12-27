const LEVELS = ["none", "low", "medium", "high"];

export function Legend(): HTMLElement {
  const container = document.createElement("div");
  container.className = "ma-grid__legend";

  const lessLabel = document.createElement("span");
  lessLabel.className = "ma-grid__legend-label";
  lessLabel.textContent = "Less";
  container.appendChild(lessLabel);

  LEVELS.forEach((level) => {
    const box = document.createElement("div");
    box.className = `ma-grid__legend-box ma-grid__legend-box--${level}`;
    container.appendChild(box);
  });

  const moreLabel = document.createElement("span");
  moreLabel.className = "ma-grid__legend-label";
  moreLabel.textContent = "More";
  container.appendChild(moreLabel);

  return container;
}
