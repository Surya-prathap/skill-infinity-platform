import { STORAGE_KEYS } from '@/constants';
import { getSessionString, setSessionString, removeSessionValue } from '@/utils';

/**
 * Lightweight token manager used by the axios client.
 * Kept dependency-free of the Redux store to avoid circular imports.
 * The store subscribes to auth changes and keeps this in sync.
 *
 * Tokens live in sessionStorage: every tab owns an independent session, so
 * testing admin / mentor / learner roles in separate tabs works without one
 * login overwriting another.
 */
export const tokenManager = {
  getAccessToken: (): string | null => getSessionString(STORAGE_KEYS.ACCESS_TOKEN),
  getRefreshToken: (): string | null => getSessionString(STORAGE_KEYS.REFRESH_TOKEN),
  setAccessToken: (token: string): void => setSessionString(STORAGE_KEYS.ACCESS_TOKEN, token),
  setRefreshToken: (token: string): void => setSessionString(STORAGE_KEYS.REFRESH_TOKEN, token),
  setTokens: (accessToken: string, refreshToken: string): void => {
    setSessionString(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    setSessionString(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },
  clearAccessToken: (): void => removeSessionValue(STORAGE_KEYS.ACCESS_TOKEN),
  clearRefreshToken: (): void => removeSessionValue(STORAGE_KEYS.REFRESH_TOKEN),
  clearTokens: (): void => {
    removeSessionValue(STORAGE_KEYS.ACCESS_TOKEN);
    removeSessionValue(STORAGE_KEYS.REFRESH_TOKEN);
  },
} as const;
