import type { CalendarResponse } from "@/types";

export default defineBackground({
  type: { chrome: "module" },
  main() {
    browser.runtime.onMessage.addListener(
      (
        _message,
        sender,
        sendResponse: (response: CalendarResponse) => void
      ) => {
        (async () => {
          try {
            const tabUrl = sender?.tab?.url;
            if (!tabUrl) return;
            const url = new URL(tabUrl);

            const response = await getCalendarResponse({
              origin: url.origin,
              onFresh: async (freshResponse) => {
                if (!freshResponse.data) return;

                const tabs = await browser.tabs.query({
                  url: MATHACADEMY_MATCHES,
                });

                logger.log(
                  "Background refresh complete, updating",
                  tabs.length,
                  "tab(s)"
                );

                for (const tab of tabs) {
                  if (tab.id) {
                    browser.tabs.sendMessage(tab.id, {
                      type: "calendar_update",
                      data: freshResponse.data,
                      isFresh: true,
                    });
                  }
                }
              },
            });

            sendResponse(response);
          } catch (error) {
            logger.error("Error:", error);
            sendResponse({
              error: error instanceof Error ? error.message : String(error),
            });
          }
        })();

        return true;
      }
    );

    logger.log("Service worker initialized");
  },
});
