import "@/assets/styles.css";
import App from "@/components/App";
import { safariFix } from "@/utils/compat";
import { MATHACADEMY_MATCHES, SELECTOR } from "@/utils/constants";
import { logger } from "@/utils/logger";
import {
  DEFAULT_HIDE_XP_FRAME,
  DEFAULT_UI_ANCHOR,
  HIDE_XP_FRAME_STORAGE_KEY,
  UI_ANCHOR_STORAGE_KEY,
} from "@/utils/settings";
import { createStorageSignal, effect } from "@/utils/signals";
import { render } from "preact";

type UI = Awaited<ReturnType<typeof createShadowRootUi>> | null;

export default defineContentScript({
  matches: MATHACADEMY_MATCHES,
  cssInjectionMode: "ui",
  async main(ctx) {
    logger.log("[MA-Grid] Content script loaded");

    safariFix(ctx);

    const hideXpFrame$ = createStorageSignal(
      HIDE_XP_FRAME_STORAGE_KEY,
      DEFAULT_HIDE_XP_FRAME
    );
    const anchor$ = createStorageSignal(
      UI_ANCHOR_STORAGE_KEY,
      DEFAULT_UI_ANCHOR
    );

    effect(() => {
      const xpFrame = document.querySelector<HTMLElement>("#xpFrame");
      if (!xpFrame) return;
      if (hideXpFrame$.value)
        xpFrame.style.setProperty("display", "none", "important");
      else xpFrame.style.removeProperty("display");
    });

    let currentUI: UI = null;
    effect(() => {
      (async () => {
        const currentAnchor = anchor$.value;
        const layout = currentAnchor === "sidebar" ? "sidebar" : "default";
        const append =
          currentAnchor === "sidebar"
            ? (anchorElement: Element, uiElement: Element) => {
                anchorElement
                  .querySelector("#courseFrame")
                  ?.insertAdjacentElement("afterend", uiElement);
              }
            : "first";

        if (currentUI) {
          currentUI.remove();
          currentUI = null;
        }

        const ui = await createShadowRootUi(ctx, {
          name: "ma-grid-ui",
          position: "inline",
          anchor: SELECTOR[layout],
          append,
          onMount(container) {
            logger.log("[MA-Grid] Dashboard detected, injecting calendar");
            const app = document.createElement("div");
            container.appendChild(app);
            render(<App layout={layout} />, app);
            return container;
          },
          onRemove(container) {
            if (container) render(null, container);
          },
        });

        currentUI = ui;
        ui.mount();
      })();
    });
  },
});
