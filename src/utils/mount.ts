import { App, type AppElement } from "@/components/App";
import { SELECTOR } from "./constants";
import type { DataSource } from "./dataSource";
import { logger } from "./logger";
import type { UiAnchor } from "./settings";

export interface MountCalendarOptions {
  anchor: UiAnchor;
  dataSource: DataSource;
  settingsButton?: HTMLElement;
  injectStyles: (shadow: ShadowRoot) => void;
  onMissingAnchor?: () => void;
}

export interface MountedCalendar {
  host: HTMLDivElement;
  shadow: ShadowRoot;
  app: AppElement;
}

export function updateXpFrameHidden(hideXpFrame: boolean) {
  const xpFrame = document.querySelector<HTMLElement>("#xpFrame");
  if (!xpFrame) return;

  if (hideXpFrame) {
    xpFrame.style.setProperty("display", "none", "important");
  } else {
    xpFrame.style.removeProperty("display");
  }
}

export function cleanupMountedApp(
  currentApp: AppElement | null,
  currentHost?: HTMLElement | null
) {
  if (currentApp) {
    currentApp.cleanup?.();
  }
  if (currentHost) {
    currentHost.remove();
  }
}

export function mountCalendarUI(
  options: MountCalendarOptions
): MountedCalendar | null {
  const { anchor, dataSource, settingsButton, injectStyles, onMissingAnchor } =
    options;

  const existing = document.querySelector("#ma-grid");
  if (existing) {
    logger.log("Removing existing element from previous session");
    existing.remove();
  }

  const layout = anchor === "sidebar" ? "sidebar" : "default";
  const anchorElement = document.querySelector(SELECTOR[layout]);
  if (!anchorElement) {
    onMissingAnchor?.();
    return null;
  }

  logger.log("Dashboard detected, injecting calendar");

  const host = document.createElement("div");
  host.id = "ma-grid";
  const shadow = host.attachShadow({ mode: "open" });

  injectStyles(shadow);

  const app = App(layout, dataSource, settingsButton);
  shadow.appendChild(app);

  if (anchor === "sidebar") {
    anchorElement
      .querySelector("#courseFrame")
      ?.insertAdjacentElement("afterend", host);
  } else {
    anchorElement.insertBefore(host, anchorElement.firstChild);
  }

  return { host, shadow, app };
}
