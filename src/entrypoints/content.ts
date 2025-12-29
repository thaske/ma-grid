import { App, type AppElement } from "@/shared/components/App";
import { ExtensionDataSource } from "@/shared/data/extensionDataSource";
import { MATHACADEMY_MATCHES, SELECTOR } from "@/shared/utils/constants";
import { logger } from "@/shared/utils/logger";
import {
  DEFAULT_HIDE_XP_FRAME,
  DEFAULT_UI_ANCHOR,
  HIDE_XP_FRAME_STORAGE_KEY,
  UI_ANCHOR_STORAGE_KEY,
} from "@/shared/utils/settings";

export default defineContentScript({
  matches: MATHACADEMY_MATCHES,
  cssInjectionMode: "manual",
  async main(_ctx) {
    logger.log("Content script loaded");

    let hideXpFrame = DEFAULT_HIDE_XP_FRAME;
    let anchor = DEFAULT_UI_ANCHOR;

    const result = await browser.storage.local.get([
      HIDE_XP_FRAME_STORAGE_KEY,
      UI_ANCHOR_STORAGE_KEY,
    ]);
    hideXpFrame =
      (result[HIDE_XP_FRAME_STORAGE_KEY] as boolean) ?? DEFAULT_HIDE_XP_FRAME;
    anchor =
      (result[UI_ANCHOR_STORAGE_KEY] as typeof DEFAULT_UI_ANCHOR) ??
      DEFAULT_UI_ANCHOR;

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

    browser.storage.onChanged.addListener((changes, area) => {
      if (area !== "local") return;

      if (HIDE_XP_FRAME_STORAGE_KEY in changes) {
        hideXpFrame = changes[HIDE_XP_FRAME_STORAGE_KEY].newValue as boolean;
        updateXpFrame();
      }

      if (UI_ANCHOR_STORAGE_KEY in changes) {
        anchor = changes[UI_ANCHOR_STORAGE_KEY]
          .newValue as typeof DEFAULT_UI_ANCHOR;
        mountUI();
      }
    });

    updateXpFrame();
    mountUI();
  },
});
