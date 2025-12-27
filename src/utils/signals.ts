/**
 * Preact signals utilities
 */

import { signal, type Signal } from "@preact/signals";

export { signal, effect, computed, batch } from "@preact/signals";
export type { Signal };

/**
 * Creates a Preact signal that syncs with browser.storage
 */
export function createStorageSignal<T>(
  key: string,
  defaultValue: T
): Signal<T> {
  const sig = signal<T>(defaultValue);

  // Initialize from storage
  browser.storage.local.get(key).then((result) => {
    if (key in result) {
      sig.value = result[key] as T;
    }
  });

  // Listen for storage changes
  browser.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    const change = changes[key];
    if (change && change.newValue !== undefined) {
      sig.value = change.newValue as T;
    }
  });

  return sig;
}
