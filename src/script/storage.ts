export const storage = {
  async getItem<T>(key: string): Promise<T | null> {
    return GM.getValue(key, null);
  },

  async setItem(key: string, value: any): Promise<void> {
    return GM.setValue(key, value);
  },

  async removeItem(key: string): Promise<void> {
    return GM.deleteValue(key);
  },
};

(globalThis as any).storage = storage;
