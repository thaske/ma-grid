type StorageChangeHandler = (newValue: unknown, oldValue?: unknown) => void;

const LEGACY_PREFIX = "local:";
const GM_MISSING = "__MA_GRID_MISSING__";

function normalizeKey(key: string) {
  return key.startsWith(LEGACY_PREFIX) ? key.slice(LEGACY_PREFIX.length) : key;
}

function legacyKeyFor(key: string) {
  return key.startsWith(LEGACY_PREFIX) ? key : `${LEGACY_PREFIX}${key}`;
}

function hasBrowserStorageLocal(): boolean {
  return (
    typeof browser !== "undefined" &&
    typeof browser.storage !== "undefined" &&
    typeof browser.storage.local !== "undefined"
  );
}

function hasChromeStorageLocal(): boolean {
  return (
    typeof chrome !== "undefined" &&
    typeof chrome.storage !== "undefined" &&
    typeof chrome.storage.local !== "undefined"
  );
}

async function storageLocalGet(keys: string | string[]) {
  if (hasBrowserStorageLocal()) {
    return browser.storage.local.get(keys);
  }
  if (hasChromeStorageLocal()) {
    return await new Promise<Record<string, unknown>>((resolve, reject) => {
      chrome.storage.local.get(keys, (items) => {
        const error = chrome.runtime?.lastError;
        if (error) {
          reject(new Error(error.message));
          return;
        }
        resolve(items);
      });
    });
  }
  return {};
}

async function storageLocalSet(items: Record<string, unknown>) {
  if (hasBrowserStorageLocal()) {
    await browser.storage.local.set(items);
    return;
  }
  if (hasChromeStorageLocal()) {
    await new Promise<void>((resolve, reject) => {
      chrome.storage.local.set(items, () => {
        const error = chrome.runtime?.lastError;
        if (error) {
          reject(new Error(error.message));
          return;
        }
        resolve();
      });
    });
  }
}

async function storageLocalRemove(keys: string | string[]) {
  if (hasBrowserStorageLocal()) {
    await browser.storage.local.remove(keys);
    return;
  }
  if (hasChromeStorageLocal()) {
    await new Promise<void>((resolve, reject) => {
      chrome.storage.local.remove(keys, () => {
        const error = chrome.runtime?.lastError;
        if (error) {
          reject(new Error(error.message));
          return;
        }
        resolve();
      });
    });
  }
}

function storageLocalWatch(
  key: string,
  callback: StorageChangeHandler
): () => void {
  const normalized = normalizeKey(key);
  const legacy = legacyKeyFor(normalized);

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

  if (hasBrowserStorageLocal()) {
    browser.storage.onChanged.addListener(listener);
    return () => browser.storage.onChanged.removeListener(listener);
  }
  if (hasChromeStorageLocal()) {
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }
  return () => {};
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
    const normalized = normalizeKey(key);
    const legacy = legacyKeyFor(normalized);

    if (hasBrowserStorageLocal() || hasChromeStorageLocal()) {
      const items = await storageLocalGet([normalized]);
      const value = (items as Record<string, unknown>)[normalized];
      if (typeof value !== "undefined") {
        return value as T;
      }
      if (legacy !== normalized) {
        const legacyItems = await storageLocalGet([legacy]);
        const legacyValue = (legacyItems as Record<string, unknown>)[legacy];
        if (typeof legacyValue !== "undefined") {
          await storageLocalSet({ [normalized]: legacyValue });
          await storageLocalRemove(legacy);
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
    const normalized = normalizeKey(key);
    const legacy = legacyKeyFor(normalized);

    if (hasBrowserStorageLocal() || hasChromeStorageLocal()) {
      await storageLocalSet({ [normalized]: value });
      if (legacy !== normalized) {
        await storageLocalRemove(legacy);
      }
      return;
    }

    await gmSetValue(normalized, value);
    if (legacy !== normalized) {
      await gmDeleteValue(legacy);
    }
  },

  async removeItem(key: string): Promise<void> {
    const normalized = normalizeKey(key);
    const legacy = legacyKeyFor(normalized);

    if (hasBrowserStorageLocal() || hasChromeStorageLocal()) {
      if (legacy !== normalized) {
        await storageLocalRemove([normalized, legacy]);
      } else {
        await storageLocalRemove(normalized);
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
