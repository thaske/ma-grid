import type { AppElement } from "@/components/App";
import mainStyles from "@/entrypoints/content/styles.css?raw";
import {
  cleanupMountedApp,
  mountCalendarUI,
  updateXpFrameHidden,
} from "@/utils/mount";
import { ScriptDataSource } from "@/utils/scriptDataSource";
import {
  HIDE_XP_FRAME_STORAGE_KEY,
  UI_ANCHOR_STORAGE_KEY,
  type UiAnchor,
} from "@/utils/settings";
import { storage } from "@/utils/storage";
import { SettingsButton } from "../../components/SettingsButton";
import { SettingsModal } from "../../components/SettingsModal";
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

  function openSettings() {
    if (!currentShadow) return;

    const handleSettingsChange = async (): Promise<void> => {
      const previousAnchor = anchor;
      hideXpFrame =
        (await storage.getItem<boolean>(HIDE_XP_FRAME_STORAGE_KEY)) ?? false;
      anchor =
        (await storage.getItem<UiAnchor>(UI_ANCHOR_STORAGE_KEY)) ??
        "incompleteTasks";

      updateXpFrameHidden(hideXpFrame);

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
    cleanupMountedApp(currentApp, currentHost);
    currentApp = null;
    currentHost = null;
    currentShadow = null;

    const settingsBtn = SettingsButton(openSettings);
    const mounted = mountCalendarUI({
      anchor,
      dataSource,
      settingsButton: settingsBtn,
      injectStyles: (shadow) => {
        const styleElem = document.createElement("style");
        styleElem.textContent = `${mainStyles}\n\n${settingsStyles}`;
        shadow.appendChild(styleElem);
      },
    });

    if (!mounted) return;

    currentHost = mounted.host;
    currentShadow = mounted.shadow;
    currentApp = mounted.app;
  }

  updateXpFrameHidden(hideXpFrame);
  mountUI();
})();
