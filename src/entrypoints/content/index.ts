import type { AppElement } from "@/components/App";
import { MATHACADEMY_MATCHES } from "@/utils/constants";
import { mountCalendarUI, updateXpFrameHidden } from "@/utils/mount";
import {
  getHideXpFrame,
  getShowTaskTimes,
  getUiAnchor,
  watchHideXpFrame,
  watchShowTaskTimes,
  watchStatsVisibility,
  watchUiAnchor,
  watchXpThresholds,
} from "@/utils/settings";
import type {
  CalendarResponse,
  DataSource,
  TaskTimesResponse,
} from "@/utils/types";
import { mountTaskTimes } from "@/utils/taskTimes";
import { defineContentScript } from "wxt/utils/define-content-script";
import calendarStyles from "./style.css?raw";

export default defineContentScript({
  matches: MATHACADEMY_MATCHES,
  cssInjectionMode: "manual",
  async main(_ctx) {
    console.log("Content script loaded");
    let cleanupTaskTimes = () => {};
    const setShowTaskTimes = (show: boolean) => {
      cleanupTaskTimes();
      cleanupTaskTimes = show
        ? mountTaskTimes(async (ids) => {
            const response: TaskTimesResponse =
              await browser.runtime.sendMessage({
                type: "task_times_request",
                ids,
              });
            if (!Array.isArray(response)) throw new Error(response.error);
            return response;
          })
        : () => {};
    };
    setShowTaskTimes(await getShowTaskTimes());

    let hideXpFrame = await getHideXpFrame();
    let anchor = await getUiAnchor();

    let currentApp: AppElement | null = null;

    const dataSource: DataSource = {
      fetchData: async (pageIndex = 0, weeksPerPage) =>
        (await browser.runtime.sendMessage({
          type: "calendar_request",
          pageIndex,
          weeksPerPage,
        })) as CalendarResponse,
    };

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
          console.log("Anchor element not found, will retry");
        },
      });

      currentApp = mounted?.app ?? null;
    }

    watchShowTaskTimes((show) => {
      setShowTaskTimes(show);
      mountUI();
    });

    watchHideXpFrame((newValue) => {
      hideXpFrame = newValue;
      updateXpFrameHidden(hideXpFrame);
    });

    watchUiAnchor((newValue) => {
      anchor = newValue;
      mountUI();
    });

    watchStatsVisibility(() => {
      mountUI();
    });

    watchXpThresholds(() => {
      mountUI();
    });

    updateXpFrameHidden(hideXpFrame);
    mountUI();
  },
});
