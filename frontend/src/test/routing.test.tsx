import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from '@/store/slices';
import { setCredentials, clearCredentials } from '@/store/slices/authSlice';
import { AuthGuard, GuestGuard } from '@/guards';
import type { AuthResponse } from '@/types';

const createTestStore = () =>
  configureStore({
    reducer: { auth: authReducer },
  });

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

const renderAuthGuardRoute = (store: ReturnType<typeof createTestStore>) =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <AuthGuard>
                <div>Protected Content</div>
              </AuthGuard>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

describe('AuthGuard', () => {
  it('redirects unauthenticated users to the login page', () => {
    const store = createTestStore();
    renderAuthGuardRoute(store);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders protected content for authenticated users', () => {
    const store = createTestStore();
    store.dispatch(setCredentials(mockAuthResponse));
    renderAuthGuardRoute(store);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});

describe('GuestGuard', () => {
  it('redirects authenticated users away from guest pages', () => {
    const store = createTestStore();
    store.dispatch(setCredentials(mockAuthResponse));
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestGuard>
                  <div>Login Form</div>
                </GuestGuard>
              }
            />
            <Route path="/dashboard" element={<div>Dashboard Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });

  it('shows the login form for guests', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestGuard>
                  <div>Login Form</div>
                </GuestGuard>
              }
            />
            <Route path="/dashboard" element={<div>Dashboard Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.getByText('Login Form')).toBeInTheDocument();
    store.dispatch(clearCredentials());
  });
});
