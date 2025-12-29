export type UiAnchor = "incompleteTasks" | "sidebar";

export const UI_ANCHOR_STORAGE_KEY = "local:maGridAnchor";
export const DEFAULT_UI_ANCHOR: UiAnchor = "incompleteTasks";
export const HIDE_XP_FRAME_STORAGE_KEY = "local:maGridHideXpFrame";
export const DEFAULT_HIDE_XP_FRAME = false;

export function isUiAnchor(value: unknown): value is UiAnchor {
  return value === "incompleteTasks" || value === "sidebar";
}

export async function getUiAnchor() {
  const stored = await storage.getItem(UI_ANCHOR_STORAGE_KEY);
  return isUiAnchor(stored) ? stored : DEFAULT_UI_ANCHOR;
}

export async function getHideXpFrame() {
  const stored = await storage.getItem(HIDE_XP_FRAME_STORAGE_KEY);
  return typeof stored === "boolean" ? stored : DEFAULT_HIDE_XP_FRAME;
}
