export function Header(settingsButton?: HTMLElement) {
  const header = document.createElement("div");
  header.className = "ma-grid__header";

  const title = document.createElement("h3");
  title.className = "ma-grid__title";
  title.textContent = "Activity";

  const actions = document.createElement("div");
  actions.className = "ma-grid__header-actions";

  if (settingsButton) {
    actions.appendChild(settingsButton);
  }

  header.appendChild(title);
  header.appendChild(actions);

  return header;
}
