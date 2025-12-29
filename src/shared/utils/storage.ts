type StorageAdapter = {
  getItem<T>(key: string): Promise<T | null>;
  setItem(key: string, value: any): Promise<void>;
  removeItem(key: string): Promise<void>;
};

function getStorage(): StorageAdapter {
  if (typeof storage !== "undefined") {
    return storage as StorageAdapter;
  }

  // Check if GM (Greasemonkey/Tampermonkey) is available
  // @ts-expect-error GM is provided by userscript manager
  if (typeof GM !== "undefined" && GM) {
    return {
      async getItem<T>(key: string): Promise<T | null> {
        try {
          // @ts-expect-error GM is provided by userscript manager
          return await GM.getValue(key, null);
        } catch {
          return null;
        }
      },
      async setItem(key: string, value: any): Promise<void> {
        // @ts-expect-error GM is provided by userscript manager
        await GM.setValue(key, value);
      },
      async removeItem(key: string): Promise<void> {
        // @ts-expect-error GM is provided by userscript manager
        await GM.deleteValue(key);
      },
    };
  }

  throw new Error(
    "Storage not initialized. GM API not available and setStorage() not called."
  );
}

export const storage = {
  async getItem<T>(key: string): Promise<T | null> {
    return getStorage().getItem<T>(key);
  },

  async setItem(key: string, value: any): Promise<void> {
    return getStorage().setItem(key, value);
  },

  async removeItem(key: string): Promise<void> {
    return getStorage().removeItem(key);
  },
};
