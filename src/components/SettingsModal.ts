import { SettingsPanel } from "@/components/SettingsPanel";

export interface SettingsModalOptions {
  onSettingsChange: () => void;
}

export function SettingsModal(options: SettingsModalOptions): HTMLElement {
  const modal = document.createElement("div");
  modal.className = "ma-grid-settings-modal";

  modal.innerHTML = `
    <div class="ma-grid-settings-overlay">
      <div class="ma-grid-settings-panel"></div>
    </div>
  `;

  const overlay = modal.querySelector(
    ".ma-grid-settings-overlay"
  ) as HTMLElement;
  const panelContainer = modal.querySelector(
    ".ma-grid-settings-panel"
  ) as HTMLElement;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      close();
    }
  };
  document.addEventListener("keydown", handleKeyDown);

  function close() {
    document.removeEventListener("keydown", handleKeyDown);
    modal.remove();
  }

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      close();
    }
  });

  // Instantiate and mount the settings panel
  const panel = SettingsPanel({
    onChange: options.onSettingsChange,
    showCloseButton: true,
    onClose: close,
    idPrefix: "ma-grid",
  });

  panelContainer.appendChild(panel.element);
  panel.initialize();

  return modal;
}
