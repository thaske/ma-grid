import type { CalendarLayout } from "./Calendar";

export interface CalendarLoadingProps {
  layout: CalendarLayout;
}

export function CalendarLoading({ layout }: CalendarLoadingProps) {
  return (
    <div
      className={[
        "ma-grid__loading",
        layout === "sidebar" && "ma-grid__loading--sidebar",
      ]}
    >
      Loading activity...
    </div>
  );
}
