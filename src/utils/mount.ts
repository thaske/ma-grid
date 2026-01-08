import { App, type AppElement } from "@/components/App";
import { SELECTOR } from "./constants";
import type { UiAnchor } from "./settings";
import type { DataSource } from "./types";

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

export function mountCalendarUI({
  anchor,
  dataSource,
  settingsButton,
  injectStyles,
  onMissingAnchor,
}: MountCalendarOptions): MountedCalendar | null {
  const existing = document.querySelector("#ma-grid");
  if (existing) {
    console.log("Removing existing element from previous session");
    existing.remove();
  }

  const layout = anchor === "sidebar" ? "sidebar" : "default";
  const anchorElement = document.querySelector(SELECTOR[layout]);
  if (!anchorElement) {
    onMissingAnchor?.();
    return null;
  }

  console.log("Dashboard detected, injecting calendar");

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
