import { App, type AppElement } from "@/shared/components/App";
import { ExtensionDataSource } from "@/shared/data/extensionDataSource";
import { MATHACADEMY_MATCHES, SELECTOR } from "@/shared/utils/constants";
import { logger } from "@/shared/utils/logger";
import {
  getHideXpFrame,
  getUiAnchor,
  HIDE_XP_FRAME_STORAGE_KEY,
  UI_ANCHOR_STORAGE_KEY,
} from "@/shared/utils/settings";

export default defineContentScript({
  matches: MATHACADEMY_MATCHES,
  cssInjectionMode: "manual",
  async main(_ctx) {
    logger.log("Content script loaded");

    let hideXpFrame = await getHideXpFrame();
    let anchor = await getUiAnchor();

    function updateXpFrame() {
      const xpFrame = document.querySelector<HTMLElement>("#xpFrame");
      if (!xpFrame) return;
      if (hideXpFrame)
        xpFrame.style.setProperty("display", "none", "important");
      else xpFrame.style.removeProperty("display");
    }

    let currentApp: AppElement | null = null;
    const dataSource = new ExtensionDataSource();

    function mountUI() {
      if (currentApp) {
        currentApp.cleanup?.();
        currentApp = null;
      }

      const existing = document.querySelector("#ma-grid");
      if (existing) {
        logger.log("Removing existing element from previous session");
        existing.remove();
      }

      const layout = anchor === "sidebar" ? "sidebar" : "default";
      const anchorElement = document.querySelector(SELECTOR[layout]);
      if (!anchorElement) {
        logger.log("Anchor element not found, will retry");
        return;
      }

      logger.log("Dashboard detected, injecting calendar");

      const host = document.createElement("div");
      host.id = "ma-grid";
      const shadow = host.attachShadow({ mode: "open" });

      const linkElem = document.createElement("link");
      linkElem.rel = "stylesheet";
      linkElem.href = browser.runtime.getURL("assets/styles.css" as any);
      shadow.appendChild(linkElem);

      const app = App(layout, dataSource);
      shadow.appendChild(app);

      if (anchor === "sidebar") {
        anchorElement
          .querySelector("#courseFrame")
          ?.insertAdjacentElement("afterend", host);
      } else {
        anchorElement.insertBefore(host, anchorElement.firstChild);
      }

      currentApp = app;
    }

    storage.watch(HIDE_XP_FRAME_STORAGE_KEY, (newValue) => {
      hideXpFrame = typeof newValue === "boolean" ? newValue : false;
      updateXpFrame();
    });

    storage.watch(UI_ANCHOR_STORAGE_KEY, (newValue) => {
      anchor = newValue === "sidebar" ? "sidebar" : "incompleteTasks";
      mountUI();
    });

    updateXpFrame();
    mountUI();
  },
});
