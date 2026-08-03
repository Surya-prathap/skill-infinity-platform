import { describe, expect, it, vi, beforeEach } from 'vitest';
import reducer, {
  clearCredentials,
  login,
  setCredentials,
  type AuthState,
} from '@/store/slices/authSlice';
import { authService } from '@/services';
import type { AuthResponse } from '@/types';

vi.mock('@/services', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
  userService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
  },
}));

const mockAuthResponse: AuthResponse = {
  userId: 'user-1',
  email: 'user@example.com',
  username: 'jane_doe',
  roles: ['ROLE_LEARNER'],
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  expiresIn: 3600,
  tokenType: 'Bearer',
};

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  status: 'idle',
  error: null,
  rememberMe: true,
};

describe('authSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('setCredentials stores tokens and marks the session authenticated', () => {
    const state = reducer(initialState, setCredentials(mockAuthResponse));
    expect(state.accessToken).toBe('access-token');
    expect(state.refreshToken).toBe('refresh-token');
    expect(state.user?.email).toBe('user@example.com');
    expect(state.user?.roles).toEqual(['ROLE_LEARNER']);
    expect(state.status).toBe('authenticated');
    expect(state.error).toBeNull();
  });

  it('clearCredentials resets the session', () => {
    const loggedIn = reducer(initialState, setCredentials(mockAuthResponse));
    const state = reducer(loggedIn, clearCredentials());
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
    expect(state.status).toBe('unauthenticated');
  });

  it('login fulfilled applies the auth payload', () => {
    const state = reducer(initialState, {
      type: login.fulfilled.type,
      payload: mockAuthResponse,
    });
    expect(state.status).toBe('authenticated');
    expect(state.user?.username).toBe('jane_doe');
  });

  it('login thunk calls the auth service', async () => {
    const mocked = vi.mocked(authService.login);
    mocked.mockResolvedValue({ data: { data: mockAuthResponse } } as never);

    const thunk = login({ email: 'user@example.com', password: 'StrongPass1!' });
    const dispatch = vi.fn();
    await thunk(dispatch as never, () => ({ auth: initialState }) as never, undefined as never);

    expect(mocked).toHaveBeenCalledWith({ email: 'user@example.com', password: 'StrongPass1!' });
  });

  it('login rejected records the error message', () => {
    const state = reducer(initialState, {
      type: login.rejected.type,
      payload: 'Invalid credentials',
      error: { message: 'Invalid credentials', name: 'Error' },
    });
    expect(state.status).toBe('unauthenticated');
    expect(state.error).toBe('Invalid credentials');
  });
});
