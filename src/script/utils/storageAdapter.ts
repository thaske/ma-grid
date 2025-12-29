import { logger } from "@/shared/logger";

export const storage = {
  async getItem<T>(key: string): Promise<T | null> {
    try {
      // @ts-expect-error GM is provided by userscript manager
      const value = await GM.getValue(key, null);
      return value;
    } catch (error) {
      logger.error(`[MA-Grid] Failed to get item "${key}":`, error);
      return null;
    }
  },

  async setItem(key: string, value: any): Promise<void> {
    try {
      // @ts-expect-error GM is provided by userscript manager
      await GM.setValue(key, value);
    } catch (error) {
      logger.error(`[MA-Grid] Failed to set item "${key}":`, error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      // @ts-expect-error GM is provided by userscript manager
      await GM.deleteValue(key);
    } catch (error) {
      logger.error(`[MA-Grid] Failed to remove item "${key}":`, error);
    }
  },
};
