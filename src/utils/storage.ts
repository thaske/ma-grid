type StorageChangeHandler = (newValue: unknown, oldValue?: unknown) => void;
type StorageChangeListener = (
  changes: Record<string, { newValue?: unknown; oldValue?: unknown }>,
  areaName: string
) => void;

type LocalStorageBackend = {
  get: (keys: string | string[]) => Promise<Record<string, unknown>>;
  set: (items: Record<string, unknown>) => Promise<void>;
  remove: (keys: string | string[]) => Promise<void>;
  addChangeListener: (listener: StorageChangeListener) => void;
  removeChangeListener: (listener: StorageChangeListener) => void;
};

const LEGACY_PREFIX = "local:";
const GM_MISSING = "__MA_GRID_MISSING__";

function normalizeKey(key: string) {
  return key.startsWith(LEGACY_PREFIX) ? key.slice(LEGACY_PREFIX.length) : key;
}

function legacyKeyFor(key: string) {
  return key.startsWith(LEGACY_PREFIX) ? key : `${LEGACY_PREFIX}${key}`;
}

function prepareKeys(key: string) {
  const normalized = normalizeKey(key);
  const legacy = legacyKeyFor(normalized);
  return { normalized, legacy };
}

function hasBrowserStorageLocal(): boolean {
  return (
    typeof browser !== "undefined" &&
    typeof browser.storage !== "undefined" &&
    typeof browser.storage.local !== "undefined"
  );
}

function resolveLocalStorageBackend(): LocalStorageBackend | null {
  if (hasBrowserStorageLocal()) {
    return {
      get: (keys) => browser.storage.local.get(keys),
      set: (items) => browser.storage.local.set(items),
      remove: (keys) => browser.storage.local.remove(keys),
      addChangeListener: (listener) =>
        browser.storage.onChanged.addListener(listener),
      removeChangeListener: (listener) =>
        browser.storage.onChanged.removeListener(listener),
    };
  }
  return null;
}

const localBackend = resolveLocalStorageBackend();

function storageLocalWatch(
  key: string,
  callback: StorageChangeHandler
): () => void {
  if (!localBackend) return () => {};

  const { normalized, legacy } = prepareKeys(key);

  const listener = (
    changes: Record<string, { newValue?: unknown; oldValue?: unknown }>,
    areaName: string
  ) => {
    if (areaName !== "local") return;
    if (changes[normalized]) {
      callback(changes[normalized].newValue, changes[normalized].oldValue);
      return;
    }
    if (legacy !== normalized && changes[legacy]) {
      callback(changes[legacy].newValue, changes[legacy].oldValue);
    }
  };

  localBackend.addChangeListener(listener);
  return () => localBackend.removeChangeListener(listener);
}

async function gmGetValue<T>(key: string): Promise<T | null> {
  if (typeof GM === "undefined" || typeof GM.getValue !== "function") {
    return null;
  }
  const value = await GM.getValue(key, GM_MISSING);
  return value === GM_MISSING ? null : (value as T);
}

async function gmSetValue(key: string, value: unknown): Promise<void> {
  if (typeof GM === "undefined" || typeof GM.setValue !== "function") {
    return;
  }
  await GM.setValue(key, value);
}

async function gmDeleteValue(key: string): Promise<void> {
  if (typeof GM === "undefined" || typeof GM.deleteValue !== "function") {
    return;
  }
  await GM.deleteValue(key);
}

export const storage = {
  async getItem<T>(key: string): Promise<T | null> {
    const { normalized, legacy } = prepareKeys(key);

    if (localBackend) {
      const items = await localBackend.get([normalized]);
      const value = (items as Record<string, unknown>)[normalized];
      if (typeof value !== "undefined") {
        return value as T;
      }
      if (legacy !== normalized) {
        const legacyItems = await localBackend.get([legacy]);
        const legacyValue = (legacyItems as Record<string, unknown>)[legacy];
        if (typeof legacyValue !== "undefined") {
          await localBackend.set({ [normalized]: legacyValue });
          await localBackend.remove(legacy);
          return legacyValue as T;
        }
      }
      return null;
    }

    const value = await gmGetValue<T>(normalized);
    if (value !== null) {
      return value;
    }
    if (legacy !== normalized) {
      const legacyValue = await gmGetValue<T>(legacy);
      if (legacyValue !== null) {
        await gmSetValue(normalized, legacyValue);
        await gmDeleteValue(legacy);
        return legacyValue;
      }
    }
    return null;
  },

  async setItem(key: string, value: unknown): Promise<void> {
    const { normalized, legacy } = prepareKeys(key);

    if (localBackend) {
      await localBackend.set({ [normalized]: value });
      if (legacy !== normalized) {
        await localBackend.remove(legacy);
      }
      return;
    }

    await gmSetValue(normalized, value);
    if (legacy !== normalized) {
      await gmDeleteValue(legacy);
    }
  },

  async removeItem(key: string): Promise<void> {
    const { normalized, legacy } = prepareKeys(key);

    if (localBackend) {
      if (legacy !== normalized) {
        await localBackend.remove([normalized, legacy]);
      } else {
        await localBackend.remove(normalized);
      }
      return;
    }

    await gmDeleteValue(normalized);
    if (legacy !== normalized) {
      await gmDeleteValue(legacy);
    }
  },

  watch(key: string, callback: StorageChangeHandler): () => void {
    return storageLocalWatch(key, callback);
  },
};
