import type { AppElement } from "@/components/App";
import { MATHACADEMY_MATCHES } from "@/utils/constants";
import { logger } from "@/utils/logger";
import { mountCalendarUI, updateXpFrameHidden } from "@/utils/mount";
import {
  getHideXpFrame,
  getUiAnchor,
  watchHideXpFrame,
  watchUiAnchor,
} from "@/utils/settings";
import type { CalendarResponse, DataSource } from "@/utils/types";
import { defineContentScript } from "wxt/utils/define-content-script";
import calendarStyles from "./style.css?raw";

type RuntimeMessage =
  | ({ type: "calendar_update" } & CalendarResponse)
  | { type: string };

export default defineContentScript({
  matches: MATHACADEMY_MATCHES,
  cssInjectionMode: "manual",
  async main(_ctx) {
    logger.log("Content script loaded");

    let hideXpFrame = await getHideXpFrame();
    let anchor = await getUiAnchor();

    let currentApp: AppElement | null = null;

    // Data source implementation for extension
    function createDataSource(): DataSource {
      let updateCallback: ((data: CalendarResponse) => void) | null = null;
      let messageListener: ((message: RuntimeMessage) => void) | null = null;

      return {
        fetchData: async () =>
          (await browser.runtime.sendMessage({})) as CalendarResponse,
        onUpdate(callback) {
          updateCallback = callback;

          // Remove previous listener if any
          if (messageListener) {
            browser.runtime.onMessage.removeListener(messageListener);
          }

          // Create new listener
          messageListener = (message: RuntimeMessage) => {
            if (
              message.type === "calendar_update" &&
              "status" in message &&
              message.status === "fresh" &&
              message.data
            ) {
              updateCallback?.(message);
            }
          };

          browser.runtime.onMessage.addListener(messageListener);
        },
        cleanup() {
          updateCallback = null;
          if (messageListener) {
            browser.runtime.onMessage.removeListener(messageListener);
            messageListener = null;
          }
        },
      };
    }

    const dataSource = createDataSource();

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
