import { CALENDAR_CONTAINER_ID } from "@/utils/constants";
import type { CalendarData } from "@/utils/types";
import { Grid, type LayoutMetrics } from "./CalendarGrid";
import { Header } from "./CalendarHeader";
import { Legend } from "./CalendarLegend";
import { Stats } from "./CalendarStats";
import { Tooltip } from "./CalendarTooltip";
import {
  DEFAULT_XP_THRESHOLDS,
  type StatsVisibility,
  type XpThresholds,
} from "@/utils/settings";

export type CalendarLayout = "default" | "sidebar";

export type CalendarNavigation = {
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

const LAYOUT_METRICS: Record<CalendarLayout, LayoutMetrics> = {
  default: { cellSize: 10, cellGap: 2, labelWidth: 12 },
  sidebar: { cellSize: 12, cellGap: 2, labelWidth: 12 },
};

// Number of weeks to show in sidebar layout (approximately 5 months)
// This keeps the calendar compact and fits well in the sidebar
const SIDEBAR_WEEKS = 22;

export function Calendar(
  data: CalendarData,
  layout: CalendarLayout,
  settingsButton?: HTMLElement,
  statsVisibility?: StatsVisibility,
  xpThresholds?: XpThresholds,
  navigation?: CalendarNavigation
) {
  const grid = getGridForLayout(data.grid, layout);
  const metrics = LAYOUT_METRICS[layout];
  const { cellSize, cellGap, labelWidth } = metrics;

  const tooltip = Tooltip();

  const container = document.createElement("div");
  container.id = CALENDAR_CONTAINER_ID;
  container.className =
    layout === "sidebar" ? "ma-grid ma-grid--sidebar" : "ma-grid";
  container.style.setProperty("--cell-size", `${cellSize}px`);
  container.style.setProperty("--cell-gap", `${cellGap}px`);
  container.style.setProperty("--label-width", `${labelWidth}px`);

  container.appendChild(Header(settingsButton));
  container.appendChild(Stats(data.stats, statsVisibility));

  const gridElement = Grid(
    grid,
    metrics,
    tooltip.show,
    tooltip.hide,
    xpThresholds ?? DEFAULT_XP_THRESHOLDS
  );

  if (navigation) {
    container.appendChild(createCalendarNavigation(gridElement, navigation));
  } else {
    container.appendChild(gridElement);
  }
  container.appendChild(Legend());
  container.appendChild(tooltip.element);

  return container;
}

function createCalendarNavigation(
  gridElement: HTMLElement,
  navigation: CalendarNavigation
) {
  const wrapper = document.createElement("div");
  wrapper.className = "ma-grid__calendar-nav";

  wrapper.appendChild(
    createNavButton(
      "‹",
      "Show older activity",
      navigation.canGoPrevious,
      navigation.onPrevious,
      "ma-grid__nav-button--previous"
    )
  );
  wrapper.appendChild(gridElement);
  wrapper.appendChild(
    createNavButton(
      "›",
      "Show newer activity",
      navigation.canGoNext,
      navigation.onNext,
      "ma-grid__nav-button--next"
    )
  );

  return wrapper;
}

function createNavButton(
  text: string,
  label: string,
  enabled: boolean,
  onClick: () => void,
  extraClassName: string
) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `ma-grid__nav-button ${extraClassName}`;
  button.textContent = text;
  button.setAttribute("aria-label", label);
  button.disabled = !enabled;
  button.addEventListener("click", onClick);
  return button;
}

function getGridForLayout(grid: CalendarData["grid"], layout: CalendarLayout) {
  if (layout !== "sidebar" || grid.length === 0) {
    return grid;
  }

  const columns = grid[0].length;
  if (columns <= SIDEBAR_WEEKS) return grid;

  return grid.map((row) => row.slice(-SIDEBAR_WEEKS));
}
