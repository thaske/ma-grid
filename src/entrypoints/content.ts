import "@/assets/styles.css";
import { App } from "@/components/App";
import { safariFix } from "@/utils/compat";
import { MATHACADEMY_MATCHES, SELECTOR } from "@/utils/constants";
import { logger } from "@/utils/logger";
import {
  DEFAULT_HIDE_XP_FRAME,
  DEFAULT_UI_ANCHOR,
  HIDE_XP_FRAME_STORAGE_KEY,
  UI_ANCHOR_STORAGE_KEY,
} from "@/utils/settings";

type UI = Awaited<ReturnType<typeof createShadowRootUi>> | null;

export default defineContentScript({
  matches: MATHACADEMY_MATCHES,
  cssInjectionMode: "ui",
  async main(ctx) {
    logger.log("[MA-Grid] Content script loaded");

    safariFix(ctx);

    let hideXpFrame = DEFAULT_HIDE_XP_FRAME;
    let anchor = DEFAULT_UI_ANCHOR;

    // Load initial values
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

    let currentUI: UI = null;

    async function recreateUI() {
      if (currentUI) {
        currentUI.remove();
        currentUI = null;
      }

      const layout = anchor === "sidebar" ? "sidebar" : "default";
      const append =
        anchor === "sidebar"
          ? (anchorElement: Element, uiElement: Element) => {
              anchorElement
                .querySelector("#courseFrame")
                ?.insertAdjacentElement("afterend", uiElement);
            }
          : "first";

      const ui = await createShadowRootUi(ctx, {
        name: "ma-grid-ui",
        position: "inline",
        anchor: SELECTOR[layout],
        append,
        onMount(container) {
          logger.log("[MA-Grid] Dashboard detected, injecting calendar");
          const app = App(layout);
          container.appendChild(app);
          return container;
        },
        onRemove(container) {
          if (container) container.innerHTML = "";
        },
      });

      currentUI = ui;
      ui.mount();
    }

    // Add storage listener
    browser.storage.onChanged.addListener((changes, area) => {
      if (area !== "local") return;

      if (HIDE_XP_FRAME_STORAGE_KEY in changes) {
        hideXpFrame = changes[HIDE_XP_FRAME_STORAGE_KEY].newValue as boolean;
        updateXpFrame();
      }

      if (UI_ANCHOR_STORAGE_KEY in changes) {
        anchor = changes[UI_ANCHOR_STORAGE_KEY]
          .newValue as typeof DEFAULT_UI_ANCHOR;
        recreateUI();
      }
    });

    // Initialize
    updateXpFrame();
    recreateUI();
  },
});
