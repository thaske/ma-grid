import type { CalendarLayout } from "./Calendar";

export interface CalendarErrorProps {
  message: string;
  layout: CalendarLayout;
}

export function CalendarError({ message, layout }: CalendarErrorProps) {
  return (
    <div
      className={[
        "ma-grid__error",
        layout === "sidebar" && "ma-grid__error--sidebar",
      ]}
    >
      {message}
    </div>
  );
}
