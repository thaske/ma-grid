import { storage } from "./storage";

export type UiAnchor = "incompleteTasks" | "sidebar";

export const UI_ANCHOR_STORAGE_KEY = "maGridAnchor";
export const DEFAULT_UI_ANCHOR: UiAnchor = "incompleteTasks";
export const HIDE_XP_FRAME_STORAGE_KEY = "maGridHideXpFrame";
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

export function watchUiAnchor(callback: (anchor: UiAnchor) => void) {
  return storage.watch(UI_ANCHOR_STORAGE_KEY, (newValue) => {
    callback(isUiAnchor(newValue) ? newValue : DEFAULT_UI_ANCHOR);
  });
}

export function watchHideXpFrame(callback: (hide: boolean) => void) {
  return storage.watch(HIDE_XP_FRAME_STORAGE_KEY, (newValue) => {
    callback(typeof newValue === "boolean" ? newValue : DEFAULT_HIDE_XP_FRAME);
  });
}
