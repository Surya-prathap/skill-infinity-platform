import { STORAGE_KEYS } from '@/constants';
import type { UserProfile } from '@/types';
import { SEED_PROFILE } from './seed';

const PROFILE_KEY = STORAGE_KEYS.PROFILE;

/** Load the locally persisted profile, falling back to the seed profile. */
export const loadStoredProfile = (): UserProfile => {
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return SEED_PROFILE;
    const parsed = JSON.parse(raw) as UserProfile;
    return parsed && typeof parsed === 'object' ? parsed : SEED_PROFILE;
  } catch {
    return SEED_PROFILE;
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
