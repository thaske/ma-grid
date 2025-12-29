import type { CalendarResponse } from "../types";
import type { DataSource } from "./data-source";

/**
 * DataSource implementation for browser extension that uses browser.runtime messaging
 * to communicate with the background script.
 */
export class ExtensionDataSource implements DataSource {
  private updateCallback: ((data: CalendarResponse) => void) | null = null;
  private messageListener:
    | ((message: any, sender: any, sendResponse: any) => void)
    | null = null;

  async fetchData(): Promise<CalendarResponse> {
    return (await browser.runtime.sendMessage({})) as CalendarResponse;
  }

  onUpdate(callback: (data: CalendarResponse) => void): void {
    this.updateCallback = callback;

    this.messageListener = (message: any) => {
      if (
        message.type === "calendar_update" &&
        message.isFresh &&
        message.data
      ) {
        this.updateCallback?.(message);
        // Remove listener after receiving fresh data
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
