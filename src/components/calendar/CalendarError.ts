import { createElement } from "../shared/createElement";
import type { CalendarLayout } from "./Calendar";

export interface CalendarErrorOptions {
  message: string;
  layout: CalendarLayout;
}

export function createCalendarError(
  options: CalendarErrorOptions
): HTMLElement {
  const { message, layout } = options;

  const classes = ["ma-grid__error"];
  if (layout === "sidebar") {
    classes.push("ma-grid__error--sidebar");
  }

  return createElement("div", classes, message);
}
