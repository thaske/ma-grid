import type { CalendarLayout } from "./Calendar";

export interface CalendarErrorProps {
  message: string;
  layout: CalendarLayout;
}

export function CalendarError(props: CalendarErrorProps) {
  const className = props.layout === "sidebar"
    ? "ma-grid__error ma-grid__error--sidebar"
    : "ma-grid__error";

  return <div class={className}>{props.message}</div>;
}
