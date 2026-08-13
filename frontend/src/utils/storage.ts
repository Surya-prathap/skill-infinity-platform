/**
 * Type-safe localStorage helpers. All reads/writes are wrapped so the app
 * never crashes when storage is unavailable (private mode, SSR, tests).
 */

const isStorageAvailable = (): boolean => {
  try {
    const testKey = '__skill_storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const memoryStore = new Map<string, string>();

const rawGet = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return memoryStore.get(key) ?? null;
  }
};

const rawSet = (key: string, value: string): void => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    memoryStore.set(key, value);
  }
};

const rawRemove = (key: string): void => {
  try {
    window.localStorage.removeItem(key);
  } catch {
    memoryStore.delete(key);
  }
};

export const getStoredValue = <T>(key: string, fallback: T): T => {
  const raw = rawGet(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const setStoredValue = <T>(key: string, value: T): void => {
  rawSet(key, JSON.stringify(value));
};

export const removeStoredValue = (key: string): void => {
  rawRemove(key);
};

export const getStoredString = (key: string): string | null => rawGet(key);
export const setStoredString = (key: string, value: string): void => rawSet(key, value);

/* ---------------- Session-scoped helpers (per-tab isolation) ---------------- */

/**
 * Auth tokens are kept in sessionStorage so each tab holds its own session.
 * Without this, logging in as a different role in a second tab overwrites the
 * first tab's tokens and every request there fails.
 */
const sessionGet = (key: string): string | null => {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return memoryStore.get(`session:${key}`) ?? null;
  }
};

const sessionSet = (key: string, value: string): void => {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    memoryStore.set(`session:${key}`, value);
  }
};

const sessionRemove = (key: string): void => {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    memoryStore.delete(`session:${key}`);
  }
};

export const getSessionString = (key: string): string | null => sessionGet(key);
export const setSessionString = (key: string, value: string): void => sessionSet(key, value);
export const removeSessionValue = (key: string): void => sessionRemove(key);

export { isStorageAvailable };
