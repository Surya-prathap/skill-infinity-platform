import { STORAGE_KEYS } from '@/constants';
import { getStoredString, setStoredString, removeStoredValue } from '@/utils';

/**
 * Lightweight token manager used by the axios client.
 * Kept dependency-free of the Redux store to avoid circular imports.
 * The store subscribes to auth changes and keeps this in sync.
 */
export const tokenManager = {
  getAccessToken: (): string | null => getStoredString(STORAGE_KEYS.ACCESS_TOKEN),
  getRefreshToken: (): string | null => getStoredString(STORAGE_KEYS.REFRESH_TOKEN),
  setAccessToken: (token: string): void => setStoredString(STORAGE_KEYS.ACCESS_TOKEN, token),
  setRefreshToken: (token: string): void => setStoredString(STORAGE_KEYS.REFRESH_TOKEN, token),
  setTokens: (accessToken: string, refreshToken: string): void => {
    setStoredString(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    setStoredString(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },
  clearAccessToken: (): void => removeStoredValue(STORAGE_KEYS.ACCESS_TOKEN),
  clearRefreshToken: (): void => removeStoredValue(STORAGE_KEYS.REFRESH_TOKEN),
  clearTokens: (): void => {
    removeStoredValue(STORAGE_KEYS.ACCESS_TOKEN);
    removeStoredValue(STORAGE_KEYS.REFRESH_TOKEN);
  },
} as const;
