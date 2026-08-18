export type SessionExpiryHandler = () => void;
export type TokensRefreshedHandler = (accessToken: string, refreshToken: string) => void;

/**
 * Bridge between the axios client and the store for session expiry.
 * Registered once by `store/index.ts` — avoids a dynamic import of the store
 * from the api layer.
 */
let handler: SessionExpiryHandler | null = null;
let tokensHandler: TokensRefreshedHandler | null = null;

export const registerSessionExpiryHandler = (fn: SessionExpiryHandler): void => {
  handler = fn;
};

export const onSessionExpired = (): void => {
  handler?.();
};

/** Registered once by the store — keeps Redux tokens in sync after a silent refresh. */
export const registerTokensRefreshedHandler = (fn: TokensRefreshedHandler): void => {
  tokensHandler = fn;
};

export const onTokensRefreshed = (accessToken: string, refreshToken: string): void => {
  tokensHandler?.(accessToken, refreshToken);
};
