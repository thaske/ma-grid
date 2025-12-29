import calendarStyles from "./styles.css?raw";

export default defineContentScript({
  matches: MATHACADEMY_MATCHES,
  cssInjectionMode: "manual",
  async main(_ctx) {
    logger.log("Content script loaded");

    let hideXpFrame = await getHideXpFrame();
    let anchor = await getUiAnchor();

    let currentApp: AppElement | null = null;
    const dataSource = new ExtensionDataSource();

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

    storage.watch(HIDE_XP_FRAME_STORAGE_KEY, (newValue) => {
      hideXpFrame = typeof newValue === "boolean" ? newValue : false;
      updateXpFrameHidden(hideXpFrame);
    });

    storage.watch(UI_ANCHOR_STORAGE_KEY, (newValue) => {
      anchor = newValue === "sidebar" ? "sidebar" : "incompleteTasks";
      mountUI();
    });

    updateXpFrameHidden(hideXpFrame);
    mountUI();
  },
});
