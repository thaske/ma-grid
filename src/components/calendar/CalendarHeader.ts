import { createElement } from "../shared/createElement";

export function createCalendarHeader(): HTMLElement {
  const header = createElement("div", "ma-grid__header");
  const title = createElement("h3", "ma-grid__title", "Activity");
  header.appendChild(title);
  return header;
}
