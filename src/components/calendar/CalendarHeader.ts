export function Header(settingsButton?: HTMLElement) {
  const header = document.createElement("div");
  header.className = "ma-grid__header";

  const title = document.createElement("h3");
  title.className = "ma-grid__title";
  title.textContent = "Activity";

  header.appendChild(title);

  if (settingsButton) {
    header.appendChild(settingsButton);
  }

  return header;
}
