/**
 * MA Grid Userscript - Main Entry Point
 * GitHub-style activity graph for Math Academy (Safari/Userscripts compatible)
 */

// IMPORTANT: Set up storage global before any other imports
// This provides the WXT-compatible storage API for shared utilities
import { storage as storageAdapter } from "./utils/storageAdapter";
// @ts-ignore - Declare storage as global for WXT compatibility
globalThis.storage = storageAdapter;

import { App } from "@/components/App";
import { SELECTOR } from "@/shared/constants";
import { logger } from "@/shared/logger";
import {
  HIDE_XP_FRAME_STORAGE_KEY,
  UI_ANCHOR_STORAGE_KEY,
  type UiAnchor,
} from "@/shared/settings";
import { SettingsButton } from "./components/SettingsButton";
import { SettingsModal } from "./components/SettingsModal";
import { ScriptDataSource } from "./utils/scriptDataSource";

import mainStyles from "@/entrypoints/styles.css?raw";
import settingsStyles from "./styles.css?raw";

const storage = storageAdapter;

(async function () {
  "use strict";

  logger.log("[MA-Grid] Userscript loaded");

  const dataSource = new ScriptDataSource();

  let hideXpFrame =
    (await storage.getItem<boolean>(HIDE_XP_FRAME_STORAGE_KEY)) ?? false;
  let anchor =
    (await storage.getItem<UiAnchor>(UI_ANCHOR_STORAGE_KEY)) ??
    "incompleteTasks";

  let currentHost: HTMLElement | null = null;
  let currentShadow: ShadowRoot | null = null;

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
    if (currentHost) {
      currentHost.remove();
      currentHost = null;
      currentShadow = null;
    }

    const existing = document.querySelector("#ma-grid");
    if (existing) {
      logger.log("[MA-Grid] Removing existing element from previous session");
      existing.remove();
    }

    const layout = anchor === "sidebar" ? "sidebar" : "default";
    const anchorElement = document.querySelector(SELECTOR[layout]);
    if (!anchorElement) {
      logger.log("[MA-Grid] Anchor element not found, will retry");
      return;
    }

    logger.log("[MA-Grid] Dashboard detected, injecting calendar");

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
  }

  updateXpFrame();
  mountUI();

  logger.log("[MA-Grid] Userscript initialized");
})();
