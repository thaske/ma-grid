type StorageAdapter = {
  getItem<T>(key: string): Promise<T | null>;
  setItem(key: string, value: any): Promise<void>;
  removeItem(key: string): Promise<void>;
};

let storageInstance: StorageAdapter | null = null;

export function setStorage(adapter: StorageAdapter): void {
  storageInstance = adapter;
}

function getStorage(): StorageAdapter {
  if (typeof storage !== "undefined") {
    return storage as StorageAdapter;
  }

  if (storageInstance) {
    return storageInstance;
  }

  throw new Error(
    "Storage not initialized. Call setStorage() in userscript entry point."
  );
}

export const storageApi = {
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
