import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  createTransform,
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

import type { PersistedState } from 'redux-persist';

import storage from './storage';

import { PERSIST_KEYS } from '@/constants';
import { tokenManager } from '@/api';
import { registerLoadingDispatch } from '@/api/loadingBridge';
import { registerSessionExpiryHandler, registerTokensRefreshedHandler } from '@/api/sessionExpiryBridge';
import { clearCredentials, tokensRefreshed } from './slices/authSlice';
import { resetUserState } from './slices/userSlice';
import {
  authReducer,
  userReducer,
  themeReducer,
  settingsReducer,
  loadingReducer,
  mentorReducer,
  adminReducer,
  type AuthState,
} from './slices';

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  theme: themeReducer,
  settings: settingsReducer,
  loading: loadingReducer,
  mentor: mentorReducer,
  admin: adminReducer,
});

const resetAuthState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  status: 'unauthenticated',
  error: null,
  rememberMe: false,
};

/**
 * Persist the active session (tokens + user) so a browser refresh restores
 * the auth state without a login. Only transient fields (status, error) are
 * stripped before persisting and re-derived after rehydration.
 */
const authPersistTransform = createTransform<AuthState, AuthState>(
  (inboundState) => ({
    ...inboundState,
    status: inboundState.accessToken ? 'authenticated' : 'unauthenticated',
    error: null,
  }),
  (outboundState) => ({
    ...resetAuthState,
    ...outboundState,
    status: outboundState.accessToken ? 'authenticated' : 'unauthenticated',
    error: null,
  }),
  { whitelist: ['auth'] },
);

const persistConfig = {
  key: PERSIST_KEYS.ROOT,
  storage,
  version: 2,
  // Only discard persisted state written by OLDER versions. The previous
  // implementation (`async () => undefined`) discarded the persisted session
  // on EVERY boot, which is what made a plain browser refresh log the user
  // out and trigger "session expired" moments later. v2 state is kept.
  migrate: async (state: PersistedState): Promise<PersistedState | undefined> => {
    if (!state) return undefined;
    return state._persist?.version === 2 ? state : undefined;
  },
  whitelist: ['auth', 'theme', 'settings'],
  transforms: [authPersistTransform],
};

const persistedReducer = persistReducer<RootState>(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

/* Keep the axios tokenManager in sync with the Redux auth state.

   NOTE: while the store is still rehydrating (auth.status === 'idle') the
   persisted session has not been restored yet. Clearing the sessionStorage
   tokens during that window would wipe the very credentials the rehydrate is
   about to read — the root cause of refresh logging users out. Only clear
   once we know the auth state is final (authenticated or unauthenticated). */
let lastAuthStatus = 'idle';
store.subscribe(() => {
  const { auth } = store.getState();
  if (auth.accessToken) {
    tokenManager.setAccessToken(auth.accessToken);
  } else if (auth.status !== 'idle') {
    tokenManager.clearAccessToken();
  }
  if (auth.refreshToken) {
    tokenManager.setRefreshToken(auth.refreshToken);
  } else if (auth.status !== 'idle') {
    tokenManager.clearRefreshToken();
  }

  // When the session ends (logout / expiry) the in-memory profile must not
  // survive into the next login — otherwise the new user briefly sees the
  // previous user's profile until a refetch lands.
  if (lastAuthStatus === 'authenticated' && auth.status === 'unauthenticated') {
    store.dispatch(resetUserState());
  }
  lastAuthStatus = auth.status;
});

/* Wire the axios client to the store without circular imports. */
registerLoadingDispatch((action) => store.dispatch(action));
registerSessionExpiryHandler(() => {
  store.dispatch(clearCredentials());
});

/* After a silent refresh-token rotation the axios layer holds the NEW tokens;
   push them back into the store so the Redux session (and what gets persisted
   on the next write) always matches what the request layer is using. */
registerTokensRefreshedHandler((accessToken, refreshToken) => {
  store.dispatch(tokensRefreshed({ accessToken, refreshToken }));
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
