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

// Import styles as raw strings (will be inlined by Vite)
import mainStyles from "@/entrypoints/styles.css?raw";
import settingsStyles from "./styles.css?raw";

// Use storage from global for consistency
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

  /**
   * Update XP frame visibility based on settings
   */
  function updateXpFrame() {
    const xpFrame = document.querySelector<HTMLElement>("#xpFrame");
    if (!xpFrame) return;

    if (hideXpFrame) {
      xpFrame.style.setProperty("display", "none", "important");
    } else {
      xpFrame.style.removeProperty("display");
    }
  }

  /**
   * Open settings modal
   */
  function openSettings() {
    if (!currentShadow) return;

    // Callback that handles settings changes and can recreate itself
    const handleSettingsChange = async (): Promise<void> => {
      // Reload settings
      const previousAnchor = anchor;
      hideXpFrame =
        (await storage.getItem<boolean>(HIDE_XP_FRAME_STORAGE_KEY)) ?? false;
      anchor =
        (await storage.getItem<UiAnchor>(UI_ANCHOR_STORAGE_KEY)) ??
        "incompleteTasks";

      // Update XP frame
      updateXpFrame();

      // Only remount if anchor position changed
      if (previousAnchor !== anchor && currentShadow) {
        // Fade out existing modal
        const existingModal = currentShadow.querySelector(
          ".ma-grid-settings-modal"
        );
        if (existingModal) {
          existingModal.classList.add("ma-grid-fading-out");
          // Wait for fade-out animation to complete
          await new Promise((resolve) => setTimeout(resolve, 150));
        }

        // Remount UI at new position
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

  /**
   * Mount the calendar UI
   */
  function mountUI() {
    // Remove existing
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

    // Find anchor element
    const layout = anchor === "sidebar" ? "sidebar" : "default";
    const anchorElement = document.querySelector(SELECTOR[layout]);
    if (!anchorElement) {
      logger.log("[MA-Grid] Anchor element not found, will retry");
      return;
    }

    logger.log("[MA-Grid] Dashboard detected, injecting calendar");

    // Create host with Shadow DOM
    const host = document.createElement("div");
    host.id = "ma-grid";
    const shadow = host.attachShadow({ mode: "open" });

    // Inject styles
    const styleElem = document.createElement("style");
    styleElem.textContent = mainStyles + "\n\n" + settingsStyles;
    shadow.appendChild(styleElem);

    // Create settings button to be placed inside calendar header
    const settingsBtn = SettingsButton(openSettings);

    // Create app with settings button
    const app = App(layout, dataSource, settingsBtn);
    shadow.appendChild(app);

    // Insert into DOM
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

  // Initialize
  updateXpFrame();
  mountUI();

  logger.log("[MA-Grid] Userscript initialized");
})();
