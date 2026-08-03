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

import storage from './storage';

import { PERSIST_KEYS } from '@/constants';
import { tokenManager } from '@/api';
import { registerLoadingDispatch } from '@/api/loadingBridge';
import { registerSessionExpiryHandler } from '@/api/sessionExpiryBridge';
import { clearCredentials } from './slices/authSlice';
import {
  authReducer,
  userReducer,
  themeReducer,
  notificationsReducer,
  settingsReducer,
  loadingReducer,
  type AuthState,
} from './slices';

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  theme: themeReducer,
  notifications: notificationsReducer,
  settings: settingsReducer,
  loading: loadingReducer,
});

const resetAuthState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  status: 'unauthenticated',
  error: null,
  rememberMe: true,
};

/**
 * Persist the session only when the user opted into "Remember Me".
 * Transient fields (status, error) are never persisted.
 */
const authPersistTransform = createTransform<AuthState, AuthState>(
  (inboundState) => {
    if (!inboundState.rememberMe) return { ...resetAuthState, rememberMe: false };
    return { ...inboundState, status: 'authenticated', error: null };
  },
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

/* Keep the axios tokenManager in sync with the Redux auth state. */
store.subscribe(() => {
  const { auth } = store.getState();
  if (auth.accessToken) tokenManager.setAccessToken(auth.accessToken);
  else tokenManager.clearAccessToken();
  if (auth.refreshToken) tokenManager.setRefreshToken(auth.refreshToken);
  else tokenManager.clearRefreshToken();
});

/* Wire the axios client to the store without circular imports. */
registerLoadingDispatch((action) => store.dispatch(action));
registerSessionExpiryHandler(() => {
  store.dispatch(clearCredentials());
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
