/**
 * Redux-persist storage backend.
 *
 * Uses sessionStorage so every browser tab owns an independent session.
 * This is what makes it possible to test admin / mentor / learner roles in
 * three separate tabs at the same time — one tab's login never overwrites
 * another tab's. Sessions survive page refreshes but end when the tab (or
 * browser) closes.
 */
const storage = {
  getItem(key: string): Promise<string | null> {
    return Promise.resolve(window.sessionStorage.getItem(key));
  },

  setItem(key: string, value: string): Promise<void> {
    window.sessionStorage.setItem(key, value);
    return Promise.resolve();
  },

  removeItem(key: string): Promise<void> {
    window.sessionStorage.removeItem(key);
    return Promise.resolve();
  },
};

export default storage;