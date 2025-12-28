import type { Activity, CachePayload } from "@/types";
import { CACHE_KEY } from "./constants";
import { logger } from "./logger";

const SECOND_MS = 1000;

export async function readCache() {
  try {
    const stored = await storage.getItem<CachePayload>(CACHE_KEY);
    if (!stored) return [];
    if (Array.isArray(stored.items)) return stored.items;
  } catch (err) {
    logger.warn("[MA-Grid] Failed to read cached activities:", err);
  }
  return [];
}

export async function isCacheFresh(maxAgeMs: number = 30 * SECOND_MS) {
  try {
    const stored = await storage.getItem<CachePayload>(CACHE_KEY);
    if (!stored || !stored.updatedAt) return false;

    const cacheAge = Date.now() - new Date(stored.updatedAt).getTime();
    return cacheAge < maxAgeMs;
  } catch (err) {
    logger.warn("[MA-Grid] Failed to check cache freshness:", err);
    return false;
  }
}
