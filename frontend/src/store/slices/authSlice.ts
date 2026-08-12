import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/services';
import { normalizeError } from '@/utils';
import type { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '@/types';

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  error: string | null;
  rememberMe: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  status: 'idle',
  error: null,
  rememberMe: false,
};

const toUser = (payload: AuthResponse): AuthUser => ({
  userId: payload.userId,
  email: payload.email,
  username: payload.username,
  roles: payload.roles,
});

/* ---------------- Async thunks ---------------- */

export const login = createAsyncThunk<AuthResponse, LoginRequest, { rejectValue: string }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(normalizeError(error).message);
    }
  },
);

export const register = createAsyncThunk<AuthResponse, RegisterRequest, { rejectValue: string }>(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authService.register(payload);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(normalizeError(error).message);
    }
  },
);

export const fetchCurrentUser = createAsyncThunk<AuthUser, void, { rejectValue: string }>(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(normalizeError(error).message);
    }
  },
);

export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState };
    const refreshToken = state.auth.refreshToken;
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      return rejectWithValue(normalizeError(error).message);
    }
  },
);

/* ---------------- Slice ---------------- */

const clearAuth = (state: AuthState): void => {
  state.accessToken = null;
  state.refreshToken = null;
  state.user = null;
  state.status = 'unauthenticated';
  state.error = null;
};

const applyAuth = (state: AuthState, payload: AuthResponse): void => {
  state.accessToken = payload.accessToken;
  state.refreshToken = payload.refreshToken;
  state.user = toUser(payload);
  state.status = 'authenticated';
  state.error = null;
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<AuthResponse | null>) {
      if (action.payload) {
        applyAuth(state, action.payload);
      } else {
        clearAuth(state);
      }
    },
    clearCredentials(state) {
      clearAuth(state);
    },
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
    },
    setRememberMe(state, action: PayloadAction<boolean>) {
      state.rememberMe = action.payload;
    },
    setAuthError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        applyAuth(state, action.payload);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'unauthenticated';
        state.error = action.payload ?? 'Unable to sign in. Please try again.';
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        // Registration creates the account but does NOT sign the user in —
        // they must log in explicitly with their new credentials. The backend
        // returns tokens for a smooth future, but they are deliberately
        // discarded here so no session is established on register.
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        state.status = 'unauthenticated';
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'unauthenticated';
        state.error = action.payload ?? 'Unable to create your account. Please try again.';
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'authenticated';
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.error = action.payload ?? null;
      })
      .addCase(logout.fulfilled, (state) => {
        clearAuth(state);
      })
      .addCase(logout.rejected, (state) => {
        clearAuth(state);
      });
  },
});

export const { setCredentials, clearCredentials, setUser, setRememberMe, setAuthError } =
  authSlice.actions;

export default authSlice.reducer;
