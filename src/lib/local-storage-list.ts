// A minimal external store for a JSON array persisted to localStorage.
// Read with useSyncExternalStore: getServerSnapshot always returns the same
// empty reference (matching the server-rendered, pre-hydration markup)
// while getSnapshot lazily hydrates from localStorage on the client. This
// avoids both hydration mismatches and setState-in-effect.
export function createLocalStorageList<T>(key: string) {
  const EMPTY: T[] = [];
  let items: T[] = EMPTY;
  let hydrated = false;
  const listeners = new Set<() => void>();

  const hydrate = () => {
    if (hydrated || typeof window === "undefined") return;
    hydrated = true;
    const stored = window.localStorage.getItem(key);
    if (stored) {
      try {
        items = JSON.parse(stored) as T[];
      } catch {
        // ignore corrupted storage
      }
    }
  };

  const notify = () => listeners.forEach((listener) => listener());

  return {
    subscribe(listener: () => void) {
      hydrate();
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      hydrate();
      return items;
    },
    getServerSnapshot() {
      return EMPTY;
    },
    set(next: T[]) {
      items = next;
      window.localStorage.setItem(key, JSON.stringify(items));
      notify();
    },
  };
}
