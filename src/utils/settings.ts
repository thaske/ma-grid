export type UiAnchor = "incompleteTasks" | "sidebar";

export const UI_ANCHOR_STORAGE_KEY = "maGridAnchor";
export const DEFAULT_UI_ANCHOR: UiAnchor = "incompleteTasks";
export const HIDE_XP_FRAME_STORAGE_KEY = "maGridHideXpFrame";
export const DEFAULT_HIDE_XP_FRAME = false;

export function isUiAnchor(value: unknown): value is UiAnchor {
  return value === "incompleteTasks" || value === "sidebar";
}

export async function getUiAnchor(): Promise<UiAnchor> {
  const stored = (await browser.storage.local.get(UI_ANCHOR_STORAGE_KEY))[
    UI_ANCHOR_STORAGE_KEY
  ];
  return isUiAnchor(stored) ? stored : DEFAULT_UI_ANCHOR;
}

export async function getHideXpFrame(): Promise<boolean> {
  const stored = (await browser.storage.local.get(HIDE_XP_FRAME_STORAGE_KEY))[
    HIDE_XP_FRAME_STORAGE_KEY
  ];
  return typeof stored === "boolean" ? stored : DEFAULT_HIDE_XP_FRAME;
}
