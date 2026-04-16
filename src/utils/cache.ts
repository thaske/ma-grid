import type { CachePayload } from "@/utils/types";
import { CACHE_KEY } from "./constants";
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
