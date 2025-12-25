import { createElement } from "../shared/createElement";
import type { CalendarLayout } from "./Calendar";

export interface CalendarLoadingOptions {
  layout: CalendarLayout;
}

export function createCalendarLoading(
  options: CalendarLoadingOptions
): HTMLElement {
  const { layout } = options;

  const classes = ["ma-grid__loading"];
  if (layout === "sidebar") {
    classes.push("ma-grid__loading--sidebar");
  }

  return createElement("div", classes, "Loading activity...");
}
