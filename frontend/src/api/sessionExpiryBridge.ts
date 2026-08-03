export type SessionExpiryHandler = () => void;

/**
 * Bridge between the axios client and the store for session expiry.
 * Registered once by `store/index.ts` — avoids a dynamic import of the store
 * from the api layer.
 */
let handler: SessionExpiryHandler | null = null;

export const registerSessionExpiryHandler = (fn: SessionExpiryHandler): void => {
  handler = fn;
};

export const onSessionExpired = (): void => {
  handler?.();
};
