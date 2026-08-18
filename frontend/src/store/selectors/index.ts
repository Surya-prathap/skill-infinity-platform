import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import type { Role } from '@/types';

/* ---------------- Auth ---------------- */
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectRefreshToken = (state: RootState) => state.auth.refreshToken;
export const selectUser = (state: RootState) => state.auth.user;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectRememberMe = (state: RootState) => state.auth.rememberMe;

export const selectIsAuthenticated = (state: RootState) =>
  state.auth.status === 'authenticated' && Boolean(state.auth.accessToken);

/**
 * True once redux-persist finished rehydrating the persisted session. Route
 * guards must wait for this before deciding to redirect: on a browser refresh
 * the auth slice starts empty (status 'idle') and only becomes authoritative
 * after the persisted tokens are restored. Redirecting earlier is what sent
 * users to /login on every refresh.
 */
export const selectAuthInitialized = (state: RootState) =>
  // `?? true`: setups without a redux-persist layer (e.g. unit tests) are
  // treated as already initialized. In the real app `_persist` is always
  // present — redux-persist sets `rehydrated: false` on boot and flips it to
  // true once the persisted session is restored.
  (state as RootState & { _persist?: { rehydrated?: boolean } })._persist?.rehydrated ?? true;

export const selectUserRoles = createSelector(
  [(state: RootState) => state.auth.user],
  (user) => user?.roles ?? ([] as Role[]),
);

export const selectHasRole = (roles: Role[]) => (state: RootState): boolean => {
  const userRoles = state.auth.user?.roles ?? [];
  return roles.some((role) => userRoles.includes(role));
};

export const selectIsAdmin = (state: RootState) => selectHasRole(['ROLE_ADMIN'])(state);
export const selectIsMentor = (state: RootState) => selectHasRole(['ROLE_MENTOR'])(state);
export const selectIsLearner = (state: RootState) => selectHasRole(['ROLE_LEARNER'])(state);

/* ---------------- User ---------------- */
export const selectUserProfile = (state: RootState) => state.user.profile;
export const selectUserProfileLoading = (state: RootState) => state.user.loading;

/* ---------------- Theme ---------------- */
export const selectThemeMode = (state: RootState) => state.theme.mode;

export const selectResolvedThemeMode = (state: RootState): 'light' | 'dark' => {
  const mode = state.theme.mode;
  if (mode === 'system') {
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
  return mode;
};

/* ---------------- Settings ---------------- */
export const selectSettings = (state: RootState) => state.settings;
export const selectLanguage = (state: RootState) => state.settings.language;
export const selectTimezone = (state: RootState) => state.settings.timezone;

/* ---------------- Mentor wizard ---------------- */
export const selectMentorStep = (state: RootState) => state.mentor.step;
export const selectMentorDraft = (state: RootState) => state.mentor.draft;
export const selectMentorSubmitted = (state: RootState) => state.mentor.submitted;

/* ---------------- Loading ---------------- */
export const selectGlobalLoading = (state: RootState) => state.loading.pendingRequests > 0;
export const selectPageLoading = (state: RootState) => state.loading.pageLoading;

/* ---------------- Admin ---------------- */
export const selectAdminSidebarCollapsed = (state: RootState) => state.admin.sidebarCollapsed;
