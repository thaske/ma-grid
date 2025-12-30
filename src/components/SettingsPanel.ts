import { SettingsForm } from "@/components/SettingsForm";

export interface SettingsPanelOptions {
  onChange?: () => void;
  showCloseButton?: boolean;
  onClose?: () => void;
  idPrefix?: string;
}

export interface SettingsPanelAPI {
  element: HTMLElement;
  initialize: () => Promise<void>;
}

export function SettingsPanel(
  options: SettingsPanelOptions = {
    showCloseButton: false,
  }
): SettingsPanelAPI {
  const main = document.createElement("main");
  main.className = "popup";
  main.setAttribute("aria-label", "MA Grid settings");

  main.innerHTML = `
    <header class="popup__header">
      <h1 class="popup__title">MA Grid</h1>
      ${
        options.showCloseButton
          ? '<button class="ma-grid-settings-close" aria-label="Close settings">&times;</button>'
          : ""
      }
    </header>

    <section class="popup__section" aria-labelledby="settings-title">
      <div class="popup__section-header">
        <h2 id="settings-title" class="popup__section-title">Settings</h2>
      </div>
      <div class="popup__card" id="settings-form-container"></div>
    </section>
  `;

  // Set up close button if needed
  if (options.showCloseButton && options.onClose) {
    const closeButton = main.querySelector(
      ".ma-grid-settings-close"
    ) as HTMLButtonElement;
    if (closeButton) {
      closeButton.addEventListener("click", options.onClose);
    }
  }

  // Instantiate and mount the settings form
  const container = main.querySelector(
    "#settings-form-container"
  ) as HTMLElement;
  const form = SettingsForm({
    onChange: options.onChange,
    idPrefix: options.idPrefix,
  });

  container.appendChild(form.element);

  return {
    element: main,
    initialize: () => form.initialize(),
  };
}
