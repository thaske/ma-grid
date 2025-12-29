import mainStyles from "@/entrypoints/styles.css?raw";
import { storage } from "@/script/storage";
import { App, type AppElement } from "@/shared/components/App";
import { SELECTOR } from "@/shared/utils/constants";
import {
  HIDE_XP_FRAME_STORAGE_KEY,
  UI_ANCHOR_STORAGE_KEY,
  type UiAnchor,
} from "@/shared/utils/settings";
import { ScriptDataSource } from "../shared/data/scriptDataSource";
import { SettingsButton } from "./components/SettingsButton";
import { SettingsModal } from "./components/SettingsModal";
import settingsStyles from "./styles.css?raw";

(async function () {
  ("use strict");

  const dataSource = new ScriptDataSource();

  let hideXpFrame =
    (await storage.getItem<boolean>(HIDE_XP_FRAME_STORAGE_KEY)) ?? false;
  let anchor =
    (await storage.getItem<UiAnchor>(UI_ANCHOR_STORAGE_KEY)) ??
    "incompleteTasks";

  let currentHost: HTMLElement | null = null;
  let currentShadow: ShadowRoot | null = null;
  let currentApp: AppElement | null = null;

  function updateXpFrame() {
    const xpFrame = document.querySelector<HTMLElement>("#xpFrame");
    if (!xpFrame) return;

    if (hideXpFrame) {
      xpFrame.style.setProperty("display", "none", "important");
    } else {
      xpFrame.style.removeProperty("display");
    }
  }

  function openSettings() {
    if (!currentShadow) return;

    const handleSettingsChange = async (): Promise<void> => {
      const previousAnchor = anchor;
      hideXpFrame =
        (await storage.getItem<boolean>(HIDE_XP_FRAME_STORAGE_KEY)) ?? false;
      anchor =
        (await storage.getItem<UiAnchor>(UI_ANCHOR_STORAGE_KEY)) ??
        "incompleteTasks";

      updateXpFrame();

      if (previousAnchor !== anchor && currentShadow) {
        const existingModal = currentShadow.querySelector(
          ".ma-grid-settings-modal"
        );
        if (existingModal) {
          existingModal.classList.add("ma-grid-fading-out");
          await new Promise((resolve) => setTimeout(resolve, 150));
        }

        mountUI();

        // Reopen settings in new shadow root with slight delay for smoother transition
        if (currentShadow) {
          await new Promise((resolve) => setTimeout(resolve, 50));
          const newModal = SettingsModal({
            onSettingsChange: handleSettingsChange,
          });
          currentShadow.appendChild(newModal);
        }
      }
    };

    const modal = SettingsModal({
      onSettingsChange: handleSettingsChange,
    });

    currentShadow.appendChild(modal);
  }

  function mountUI() {
    if (currentApp) {
      currentApp.cleanup?.();
      currentApp = null;
    }

    if (currentHost) {
      currentHost.remove();
      currentHost = null;
      currentShadow = null;
    }

    const existing = document.querySelector("#ma-grid");
    if (existing) {
      existing.remove();
    }

    const layout = anchor === "sidebar" ? "sidebar" : "default";
    const anchorElement = document.querySelector(SELECTOR[layout]);
    if (!anchorElement) return;

    const host = document.createElement("div");
    host.id = "ma-grid";
    const shadow = host.attachShadow({ mode: "open" });

    const styleElem = document.createElement("style");
    styleElem.textContent = mainStyles + "\n\n" + settingsStyles;
    shadow.appendChild(styleElem);

    const settingsBtn = SettingsButton(openSettings);

    const app = App(layout, dataSource, settingsBtn);
    shadow.appendChild(app);

    if (anchor === "sidebar") {
      anchorElement
        .querySelector("#courseFrame")
        ?.insertAdjacentElement("afterend", host);
    } else {
      anchorElement.insertBefore(host, anchorElement.firstChild);
    }

    currentHost = host;
    currentShadow = shadow;
    currentApp = app;
  }

  updateXpFrame();
  mountUI();
})();
