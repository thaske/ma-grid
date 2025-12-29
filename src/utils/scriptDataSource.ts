import { getCalendarResponse } from "./calendarResponse";
import type { DataSource } from "./dataSource";
import type { CalendarResponse } from "@/types";

export class ScriptDataSource implements DataSource {
  private updateCallback: ((response: CalendarResponse) => void) | null = null;

  onUpdate(callback: (response: CalendarResponse) => void): void {
    this.updateCallback = callback;
  }

  async fetchData(): Promise<CalendarResponse> {
    return getCalendarResponse({
      origin: window.location.origin,
      onFresh: (response) => {
        if (response.data && this.updateCallback) {
          this.updateCallback(response);
        }
      },
    });
  }
}
