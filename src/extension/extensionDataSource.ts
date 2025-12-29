import type { DataSource } from "@/shared/utils/dataSource";
import type { CalendarResponse } from "../types";

type RuntimeMessage =
  | ({ type: "calendar_update" } & CalendarResponse)
  | { type: string };

export class ExtensionDataSource implements DataSource {
  private updateCallback: ((data: CalendarResponse) => void) | null = null;
  private messageListener: ((message: RuntimeMessage) => void) | null = null;

  async fetchData(): Promise<CalendarResponse> {
    return (await browser.runtime.sendMessage({})) as CalendarResponse;
  }

  onUpdate(callback: (data: CalendarResponse) => void): void {
    this.updateCallback = callback;

    if (this.messageListener) {
      browser.runtime.onMessage.removeListener(this.messageListener);
      this.messageListener = null;
    }

    this.messageListener = (message: RuntimeMessage) => {
      if (
        message.type === "calendar_update" &&
        "isFresh" in message &&
        message.isFresh &&
        message.data
      ) {
        this.updateCallback?.(message);
        if (this.messageListener) {
          browser.runtime.onMessage.removeListener(this.messageListener);
          this.messageListener = null;
        }
      }
    };

    browser.runtime.onMessage.addListener(this.messageListener);
  }

  cleanup(): void {
    if (this.messageListener) {
      browser.runtime.onMessage.removeListener(this.messageListener);
      this.messageListener = null;
    }
    this.updateCallback = null;
  }
}
