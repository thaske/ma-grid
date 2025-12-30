import SettingsIcon from "@/assets/Settings.svg?raw";

export function SettingsButton(onClick: () => void): HTMLElement {
  const button = document.createElement("button");
  button.className = "ma-grid-settings-btn";
  button.setAttribute("aria-label", "Settings");
  button.title = "Settings";

  button.innerHTML = SettingsIcon;

  button.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  });

  return button;
}
