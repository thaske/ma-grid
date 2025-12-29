import { defineContentScript } from "wxt/utils/define-content-script";
import calendarStyles from "./styles.css?raw";
import type { AppElement } from "@/components/App";
import { createExtensionDataSource } from "@/utils/extensionDataSource";
import { logger } from "@/utils/logger";
import { mountCalendarUI, updateXpFrameHidden } from "@/utils/mount";
import { MATHACADEMY_MATCHES } from "@/utils/constants";
import {
  getHideXpFrame,
  getUiAnchor,
  watchHideXpFrame,
  watchUiAnchor,
} from "@/utils/settings";

export default defineContentScript({
  matches: MATHACADEMY_MATCHES,
  cssInjectionMode: "manual",
  async main(_ctx) {
    logger.log("Content script loaded");

    let hideXpFrame = await getHideXpFrame();
    let anchor = await getUiAnchor();

    let currentApp: AppElement | null = null;
    const dataSource = createExtensionDataSource();

    function mountUI() {
      if (currentApp) {
        currentApp.cleanup?.();
        currentApp = null;
      }

      const mounted = mountCalendarUI({
        anchor,
        dataSource,
        injectStyles: (shadow) => {
          const styleElem = document.createElement("style");
          styleElem.textContent = calendarStyles;
          shadow.appendChild(styleElem);
        },
        onMissingAnchor: () => {
          logger.log("Anchor element not found, will retry");
        },
      });

      currentApp = mounted?.app ?? null;
    }

    watchHideXpFrame((newValue) => {
      hideXpFrame = newValue;
      updateXpFrameHidden(hideXpFrame);
    });

    watchUiAnchor((newValue) => {
      anchor = newValue;
      mountUI();
    });

    updateXpFrameHidden(hideXpFrame);
    mountUI();
  },
});
