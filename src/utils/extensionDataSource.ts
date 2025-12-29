import { createDataSource, type DataSource } from "./dataSource";
import type { CalendarResponse } from "@/types";

type RuntimeMessage =
  | ({ type: "calendar_update" } & CalendarResponse)
  | { type: string };

export function createExtensionDataSource(): DataSource {
  return createDataSource({
    fetchData: async () =>
      (await browser.runtime.sendMessage({})) as CalendarResponse,
    subscribe: (emit) => {
      const listener = (message: RuntimeMessage) => {
        if (
          message.type === "calendar_update" &&
          "status" in message &&
          message.status === "fresh" &&
          message.data
        ) {
          emit(message);
          browser.runtime.onMessage.removeListener(listener);
        }
      };

      browser.runtime.onMessage.addListener(listener);
      return () => {
        browser.runtime.onMessage.removeListener(listener);
      };
    },
  });
}
