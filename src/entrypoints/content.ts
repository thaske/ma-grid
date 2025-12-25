import "@/assets/styles.css";
import {
  createCalendar,
  createCalendarError,
  createCalendarLoading,
  type CalendarLayout,
} from "@/components";
import type { CalendarResponse } from "@/types";
import { DASHBOARD_SELECTOR, SIDEBAR_SELECTOR } from "@/utils/constants";
import { logger } from "@/utils/logger";
import {
  DEFAULT_HIDE_XP_FRAME,
  DEFAULT_UI_ANCHOR,
  HIDE_XP_FRAME_STORAGE_KEY,
  UI_ANCHOR_STORAGE_KEY,
  getHideXpFrame,
  getUiAnchor,
  isUiAnchor,
  type UiAnchor,
} from "@/utils/settings";

const LAYOUT_METRICS = {
  default: { cellSize: 10, cellGap: 2, labelWidth: 12 },
  sidebar: { cellSize: 12, cellGap: 2, labelWidth: 12 },
} as const;

const SIDEBAR_WEEKS = 22;

export default defineContentScript({
  matches: [
    "https://mathacademy.com/learn",
    "https://www.mathacademy.com/learn",
  ],
  cssInjectionMode: "ui",
  async main(ctx) {
    // To prevent multiple injections of the content script in Safari, ensure the script runs only in the main frame.
    // This can be achieved by checking if `window.top === window` before executing the script logic.
    // https://stackoverflow.com/a/56891145
    if (window.top !== window) return;
    if (document.documentElement?.dataset.maGridContentScriptLoaded) return;
    document.documentElement.dataset.maGridContentScriptLoaded = "true";
    ctx.onInvalidated(() => {
      if (document.documentElement?.dataset.maGridContentScriptLoaded) {
        delete document.documentElement.dataset.maGridContentScriptLoaded;
      }
    });

    logger.log("[MA-Grid] Content script loaded");

    const [anchor, hideXpFrame] = await Promise.all([
      getUiAnchor(),
      getHideXpFrame(),
    ]);

    const applyXpFrameVisibility = (hidden: boolean) => {
      const xpFrame = document.querySelector<HTMLElement>("#xpFrame");
      if (!xpFrame) return;
      if (hidden) {
        xpFrame.style.setProperty("display", "none", "important");
      } else {
        xpFrame.style.removeProperty("display");
      }
    };

    applyXpFrameVisibility(hideXpFrame);

    let currentUi: Awaited<ReturnType<typeof createShadowRootUi>> | null = null;
    let currentAnchor: UiAnchor | null = null;
    let mountVersion = 0;
    const mountUi = async (nextAnchor: UiAnchor) => {
      const layout: CalendarLayout =
        nextAnchor === "sidebar" ? "sidebar" : "default";
      const anchorSelector =
        nextAnchor === "sidebar" ? SIDEBAR_SELECTOR : DASHBOARD_SELECTOR;
      const append =
        nextAnchor === "sidebar"
          ? (anchorElement: Element, uiElement: Element) => {
              const scopedCourseFrame =
                anchorElement.querySelector("#courseFrame");
              if (scopedCourseFrame && scopedCourseFrame.parentElement) {
                scopedCourseFrame.insertAdjacentElement("afterend", uiElement);
                return;
              }

              const parent = anchorElement.parentElement;
              const siblingCourseFrame = parent?.querySelector("#courseFrame");
              if (
                siblingCourseFrame &&
                siblingCourseFrame.parentElement === parent
              ) {
                siblingCourseFrame.insertAdjacentElement("afterend", uiElement);
                return;
              }

              anchorElement.appendChild(uiElement);
            }
          : "first";
      const version = ++mountVersion;

      currentUi?.remove();
      currentUi = null;

      const ui = await createShadowRootUi(ctx, {
        name: "ma-grid-ui",
        position: "inline",
        anchor: anchorSelector,
        append,
        onMount(container) {
          logger.log("[MA-Grid] Dashboard detected, injecting calendar");
          container.textContent = "";

          const loading = createCalendarLoading({ layout });
          container.append(loading);

          // Extract calendar rendering into reusable function
          const renderCalendar = (
            displayData: CalendarResponse["data"]
          ): HTMLElement => {
            if (!displayData) {
              throw new Error("No calendar data provided");
            }

            const metrics = LAYOUT_METRICS[layout];
            let grid = displayData.grid;
            if (layout === "sidebar" && displayData.grid.length > 0) {
              const columns = displayData.grid[0].length;
              if (columns > SIDEBAR_WEEKS) {
                grid = displayData.grid.map((row) => row.slice(-SIDEBAR_WEEKS));
              }
            }

            return createCalendar({
              data: { grid, stats: displayData.stats },
              layout,
              metrics,
            });
          };

          void (async () => {
            try {
              const response = (await browser.runtime.sendMessage(
                {}
              )) as CalendarResponse;

              // Handle stale response - show calendar immediately with refresh indicator
              if (response.isStale && response.data) {
                loading.remove();
                logger.log(
                  "[MA-Grid] Rendering stale calendar, waiting for fresh data..."
                );

                const calendar = renderCalendar(response.data);
                calendar.classList.add("ma-grid--refreshing");
                container.append(calendar);

                // Listen for fresh data update from background worker
                const messageListener = (message: any) => {
                  if (
                    message.type === "calendar_update" &&
                    message.isFresh &&
                    message.data
                  ) {
                    logger.log(
                      "[MA-Grid] Received fresh data, updating calendar"
                    );
                    const freshCalendar = renderCalendar(message.data);
                    calendar.replaceWith(freshCalendar);
                    browser.runtime.onMessage.removeListener(messageListener);
                  }
                };

                browser.runtime.onMessage.addListener(messageListener);
                return;
              }

              loading.remove();

              if (response.error) {
                logger.error(
                  "[MA-Grid] Error from service worker:",
                  response.error
                );
                const error = createCalendarError({
                  message: response.error,
                  layout,
                });
                container.append(error);
                return;
              }

              if (!response.data) {
                logger.error("[MA-Grid] No data received");
                const error = createCalendarError({
                  message: "No activity data available",
                  layout,
                });
                container.append(error);
                return;
              }

              // Render fresh calendar data
              const calendar = renderCalendar(response.data);
              container.append(calendar);

              logger.log("[MA-Grid] Calendar injected successfully");
            } catch (error) {
              logger.error("[MA-Grid] Failed to load calendar:", error);
              loading.remove();

              const errorMsg = createCalendarError({
                message:
                  error instanceof Error
                    ? error.message
                    : "Failed to load activity data",
                layout,
              });
              container.append(errorMsg);
            }
          })();
        },
      });

      if (version !== mountVersion) {
        ui.remove();
        return;
      }

      currentUi = ui;
      currentAnchor = nextAnchor;
      ui.autoMount();
    };

    await mountUi(anchor);

    browser.storage.onChanged.addListener((changes, area) => {
      if (area !== "local") return;

      const xpChange = changes[HIDE_XP_FRAME_STORAGE_KEY];
      if (xpChange) {
        const nextValue =
          typeof xpChange.newValue === "boolean"
            ? xpChange.newValue
            : DEFAULT_HIDE_XP_FRAME;
        applyXpFrameVisibility(nextValue);
      }

      const anchorChange = changes[UI_ANCHOR_STORAGE_KEY];
      if (anchorChange) {
        const nextAnchor = isUiAnchor(anchorChange.newValue)
          ? anchorChange.newValue
          : DEFAULT_UI_ANCHOR;
        if (nextAnchor !== currentAnchor) {
          void mountUi(nextAnchor);
        }
      }
    });
  },
});
