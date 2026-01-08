import type { CachePayload } from "@/utils/types";
import { CACHE_KEY, SECOND_MS } from "./constants";
import { storage } from "./storage";

export async function readCache() {
  try {
    const stored = await storage.getItem<CachePayload>(CACHE_KEY);
    if (!stored) return [];
    if (Array.isArray(stored.items)) return stored.items;
  } catch (err) {
    console.warn("Failed to read cached activities:", err);
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
    console.warn("Failed to check cache freshness:", err);
    return false;
  }
}
