import { browser, createShadowRootUi, defineContentScript } from "#imports";
import "@/assets/styles.css";
import type { CalendarResponse, DailyXP } from "@/types";
import {
  CALENDAR_CONTAINER_ID,
  DASHBOARD_SELECTOR,
  SIDEBAR_SELECTOR,
  XP_COLORS,
} from "@/utils/constants";
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

type CalendarLayout = "default" | "sidebar";

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

    const createErrorMessage = (
      message: string,
      layout: CalendarLayout = "default"
    ): HTMLElement => {
      const error = document.createElement("div");
      error.className = "ma-grid__error";
      if (layout === "sidebar") {
        error.classList.add("ma-grid__error--sidebar");
      }
      error.textContent = message;
      return error;
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

          const loading = document.createElement("div");
          loading.className = "ma-grid__loading";
          if (layout === "sidebar") {
            loading.classList.add("ma-grid__loading--sidebar");
          }
          loading.textContent = "Loading activity...";
          container.append(loading);

          void (async () => {
            try {
              const response = (await browser.runtime.sendMessage(
                {}
              )) as CalendarResponse;

              loading.remove();

              if (response.error) {
                logger.error(
                  "[MA-Grid] Error from service worker:",
                  response.error
                );
                const error = createErrorMessage(response.error, layout);
                container.append(error);
                return;
              }

              if (!response.data) {
                logger.error("[MA-Grid] No data received");
                const error = createErrorMessage(
                  "No activity data available",
                  layout
                );
                container.append(error);
                return;
              }

              const displayData = response.data;

              const metrics = LAYOUT_METRICS[layout];
              let grid = displayData.grid;
              if (layout === "sidebar" && displayData.grid.length > 0) {
                const columns = displayData.grid[0].length;
                if (columns > SIDEBAR_WEEKS) {
                  grid = displayData.grid.map((row) =>
                    row.slice(-SIDEBAR_WEEKS)
                  );
                }
              }

              const calendar = document.createElement("div");
              calendar.id = CALENDAR_CONTAINER_ID;
              calendar.className = "ma-grid";
              calendar.style.setProperty(
                "--cell-size",
                `${metrics.cellSize}px`
              );
              calendar.style.setProperty("--cell-gap", `${metrics.cellGap}px`);
              calendar.style.setProperty(
                "--label-width",
                `${metrics.labelWidth}px`
              );
              if (layout === "sidebar") {
                calendar.classList.add("ma-grid--sidebar");
              }

              const header = document.createElement("div");
              header.className = "ma-grid__header";

              const title = document.createElement("h3");
              title.className = "ma-grid__title";
              title.textContent = "Activity";
              header.appendChild(title);

              calendar.appendChild(header);

              const statsBar = document.createElement("div");
              statsBar.className = "ma-grid__stats";
              [
                { value: displayData.stats.streak, label: "Current Streak" },
                { value: displayData.stats.avgXP, label: "Avg Daily XP" },
                { value: displayData.stats.maxXP, label: "Max Daily XP" },
              ].forEach((item) => {
                const statItem = document.createElement("div");
                statItem.className = "ma-grid__stat";

                const value = document.createElement("div");
                value.className = "ma-grid__stat-value";
                value.textContent = String(item.value);

                const label = document.createElement("div");
                label.className = "ma-grid__stat-label";
                label.textContent = item.label;

                statItem.appendChild(value);
                statItem.appendChild(label);
                statsBar.appendChild(statItem);
              });
              calendar.appendChild(statsBar);

              const wrapper = document.createElement("div");
              wrapper.className = "ma-grid__wrapper";

              const monthLabels = document.createElement("div");
              monthLabels.className = "ma-grid__month-labels";
              if (grid.length !== 0 && grid[0].length !== 0) {
                let currentMonth: string | null = null;
                const monthPositions: { label: string; colStart: number }[] =
                  [];

                grid[0].forEach((dayData, colIndex) => {
                  const date = new Date(dayData.date + "T12:00:00");
                  const monthName = date.toLocaleDateString("en-US", {
                    month: "short",
                  });

                  if (monthName !== currentMonth) {
                    monthPositions.push({
                      label: monthName,
                      colStart: colIndex,
                    });
                    currentMonth = monthName;
                  }
                });

                const cellWithGap = metrics.cellSize + metrics.cellGap;

                monthPositions.forEach((month) => {
                  const label = document.createElement("div");
                  label.className = "ma-grid__month-label";
                  label.textContent = month.label;
                  label.style.position = "absolute";
                  label.style.left = `${month.colStart * cellWithGap}px`;
                  monthLabels.appendChild(label);
                });

                monthLabels.style.position = "relative";
              }
              wrapper.appendChild(monthLabels);

              const gridContainer = document.createElement("div");
              gridContainer.className = "ma-grid__grid";

              const weekdayLabels = document.createElement("div");
              weekdayLabels.className = "ma-grid__weekday-labels";
              ["", "M", "", "W", "", "F", ""].forEach((label) => {
                const labelEl = document.createElement("div");
                labelEl.className = "ma-grid__weekday-label";
                labelEl.textContent = label;
                weekdayLabels.appendChild(labelEl);
              });
              gridContainer.appendChild(weekdayLabels);

              const daysGrid = document.createElement("div");
              daysGrid.className = "ma-grid__days";

              const tooltip = document.createElement("div");
              tooltip.className = "ma-grid__tooltip";
              tooltip.style.display = "none";
              calendar.appendChild(tooltip);

              const showTooltip = (day: DailyXP, x: number, y: number) => {
                const xpText = day.xp === 0 ? "No activity" : `${day.xp} XP`;
                const dateEl = document.createElement("div");
                dateEl.className = "ma-grid__tooltip-date";
                const [year, month, dayOfMonth] = day.date
                  .split("-")
                  .map(Number);
                const date = new Date(year, month - 1, dayOfMonth);
                dateEl.textContent = date.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });

                const xpEl = document.createElement("div");
                xpEl.className = "ma-grid__tooltip-xp";
                xpEl.textContent = xpText;

                tooltip.replaceChildren(dateEl, xpEl);
                tooltip.style.display = "block";

                const offset = 10;
                const rect = tooltip.getBoundingClientRect();
                let left = x + offset;

                if (left + rect.width > window.innerWidth) {
                  left = x - offset - rect.width;
                }

                tooltip.style.left = `${Math.max(0, left)}px`;
                tooltip.style.top = `${y + offset}px`;
              };

              grid.forEach((weekRow, rowIdx) => {
                weekRow.forEach((dayData, colIdx) => {
                  const cell = document.createElement("div");
                  cell.className = "ma-grid__cell";
                  cell.style.backgroundColor =
                    dayData.xp === 0
                      ? XP_COLORS.NONE
                      : dayData.xp < 15
                      ? XP_COLORS.LOW
                      : dayData.xp < 30
                      ? XP_COLORS.MEDIUM
                      : XP_COLORS.HIGH;
                  cell.style.gridRow = String(rowIdx + 1);
                  cell.style.gridColumn = String(colIdx + 1);

                  cell.addEventListener("mouseenter", (e) => {
                    showTooltip(dayData, e.clientX, e.clientY);
                  });

                  cell.addEventListener("mousemove", (e) => {
                    showTooltip(dayData, e.clientX, e.clientY);
                  });

                  cell.addEventListener("mouseleave", () => {
                    tooltip.style.display = "none";
                  });

                  daysGrid.appendChild(cell);
                });
              });

              gridContainer.appendChild(daysGrid);
              wrapper.appendChild(gridContainer);
              calendar.appendChild(wrapper);

              const legend = document.createElement("div");
              legend.className = "ma-grid__legend";

              const lessLabel = document.createElement("span");
              lessLabel.className = "ma-grid__legend-label";
              lessLabel.textContent = "Less";
              legend.appendChild(lessLabel);

              const colors = [
                XP_COLORS.NONE,
                XP_COLORS.LOW,
                XP_COLORS.MEDIUM,
                XP_COLORS.HIGH,
              ];

              colors.forEach((color) => {
                const box = document.createElement("div");
                box.className = "ma-grid__legend-box";
                box.style.backgroundColor = color;
                legend.appendChild(box);
              });

              const moreLabel = document.createElement("span");
              moreLabel.className = "ma-grid__legend-label";
              moreLabel.textContent = "More";
              legend.appendChild(moreLabel);

              calendar.appendChild(legend);
              container.append(calendar);

              logger.log("[MA-Grid] Calendar injected successfully");
            } catch (error) {
              logger.error("[MA-Grid] Failed to load calendar:", error);
              loading.remove();

              const errorMsg = createErrorMessage(
                error instanceof Error
                  ? error.message
                  : "Failed to load activity data",
                layout
              );
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
