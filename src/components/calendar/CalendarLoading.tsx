import type { CalendarLayout } from "./Calendar";

export interface CalendarLoadingProps {
  layout: CalendarLayout;
}

export function CalendarLoading(props: CalendarLoadingProps) {
  const className = props.layout === "sidebar"
    ? "ma-grid__loading ma-grid__loading--sidebar"
    : "ma-grid__loading";

  return <div class={className}>Loading activity...</div>;
}
