import { storage } from "#imports";
import type { Activity, CachePayload } from "@/types";
import { CACHE_KEY } from "./constants";
import { logger } from "./logger";

export async function readCache(): Promise<Activity[]> {
  try {
    const stored = await storage.getItem<CachePayload>(CACHE_KEY);
    if (!stored) return [];
    if (Array.isArray(stored.items)) return stored.items;
  } catch (err) {
    logger.warn("[MA-Grid] Failed to read cached activities:", err);
  }
  return [];
}
