import { storage } from "./storage";

export type UiAnchor = "incompleteTasks" | "sidebar";

export const UI_ANCHOR_STORAGE_KEY = "maGridAnchor";
export const DEFAULT_UI_ANCHOR: UiAnchor = "incompleteTasks";
export const HIDE_XP_FRAME_STORAGE_KEY = "maGridHideXpFrame";
export const DEFAULT_HIDE_XP_FRAME = false;

export function isUiAnchor(value: unknown): value is UiAnchor {
  return value === "incompleteTasks" || value === "sidebar";
}

function createSetting<T>(
  key: string,
  defaultValue: T,
  validator: (value: unknown) => value is T
) {
  return {
    get: async () => {
      const stored = await storage.getItem(key);
      return validator(stored) ? stored : defaultValue;
    },
    watch: (callback: (value: T) => void) => {
      return storage.watch(key, (newValue) => {
        callback(validator(newValue) ? newValue : defaultValue);
      });
    },
  };
}

const uiAnchorSetting = createSetting(
  UI_ANCHOR_STORAGE_KEY,
  DEFAULT_UI_ANCHOR,
  isUiAnchor
);

const hideXpFrameSetting = createSetting(
  HIDE_XP_FRAME_STORAGE_KEY,
  DEFAULT_HIDE_XP_FRAME,
  (value: unknown): value is boolean => typeof value === "boolean"
);

export const getUiAnchor = uiAnchorSetting.get;
export const watchUiAnchor = uiAnchorSetting.watch;
export const getHideXpFrame = hideXpFrameSetting.get;
export const watchHideXpFrame = hideXpFrameSetting.watch;
