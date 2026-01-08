import { storage } from "./storage";

export type UiAnchor = "incompleteTasks" | "sidebar";
export type StatKey = "currentStreak" | "longestStreak" | "avgXP" | "maxXP";
export type StatsVisibility = Record<StatKey, boolean>;

export const UI_ANCHOR_STORAGE_KEY = "maGridAnchor";
export const DEFAULT_UI_ANCHOR: UiAnchor = "incompleteTasks";
export const HIDE_XP_FRAME_STORAGE_KEY = "maGridHideXpFrame";
export const DEFAULT_HIDE_XP_FRAME = false;
export const STATS_VISIBILITY_STORAGE_KEY = "maGridStatsVisibility";
export const DEFAULT_STATS_VISIBILITY: StatsVisibility = {
  currentStreak: true,
  longestStreak: true,
  avgXP: true,
  maxXP: true,
};

export function isUiAnchor(value: unknown): value is UiAnchor {
  return value === "incompleteTasks" || value === "sidebar";
}

function isStatsVisibility(value: unknown): value is StatsVisibility {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.currentStreak === "boolean" &&
    typeof record.longestStreak === "boolean" &&
    typeof record.avgXP === "boolean" &&
    typeof record.maxXP === "boolean"
  );
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

const statsVisibilitySetting = createSetting(
  STATS_VISIBILITY_STORAGE_KEY,
  DEFAULT_STATS_VISIBILITY,
  isStatsVisibility
);

export const getUiAnchor = uiAnchorSetting.get;
export const watchUiAnchor = uiAnchorSetting.watch;
export const getHideXpFrame = hideXpFrameSetting.get;
export const watchHideXpFrame = hideXpFrameSetting.watch;
export const getStatsVisibility = statsVisibilitySetting.get;
export const watchStatsVisibility = statsVisibilitySetting.watch;
