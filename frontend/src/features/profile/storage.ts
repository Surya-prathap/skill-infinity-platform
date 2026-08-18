import { STORAGE_KEYS } from '@/constants';
import type { UserProfile } from '@/types';

const PROFILE_KEY = STORAGE_KEYS.PROFILE;

/**
 * Load the locally persisted profile (a cache of the last server response).
 * Returns null when nothing has been cached yet — no seed/demo data.
 */
export const loadStoredProfile = (): UserProfile | null => {
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfile;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

export const persistProfile = (profile: UserProfile): void => {
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Storage may be full (e.g. large data-URL resumes) — fail silently.
  }
};

export const clearStoredProfile = (): void => {
  try {
    window.localStorage.removeItem(PROFILE_KEY);
  } catch {
    // ignore
  }
};
