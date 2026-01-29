import { storage } from "./storage";

export type UiAnchor = "incompleteTasks" | "sidebar";
export type StatKey = "currentStreak" | "longestStreak" | "avgXP" | "maxXP";
export type StatsVisibility = Record<StatKey, boolean>;
export type XpThresholds = { medium: number; high: number };

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
export const XP_THRESHOLDS_STORAGE_KEY = "maGridXpThresholds";
export const DEFAULT_XP_THRESHOLDS: XpThresholds = { medium: 15, high: 30 };

export function isUiAnchor(value: unknown): value is UiAnchor {
  return value === "incompleteTasks" || value === "sidebar";
}

function isXpThresholds(value: unknown): value is XpThresholds {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.medium === "number" &&
    typeof obj.high === "number" &&
    obj.medium > 0 &&
    obj.high > obj.medium
  );
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

const xpThresholdsSetting = createSetting(
  XP_THRESHOLDS_STORAGE_KEY,
  DEFAULT_XP_THRESHOLDS,
  isXpThresholds
);

export const getUiAnchor = uiAnchorSetting.get;
export const watchUiAnchor = uiAnchorSetting.watch;
export const getHideXpFrame = hideXpFrameSetting.get;
export const watchHideXpFrame = hideXpFrameSetting.watch;
export const getStatsVisibility = statsVisibilitySetting.get;
export const watchStatsVisibility = statsVisibilitySetting.watch;
export const getXpThresholds = xpThresholdsSetting.get;
export const watchXpThresholds = xpThresholdsSetting.watch;
