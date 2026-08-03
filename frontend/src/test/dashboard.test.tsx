import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import { DashboardPage } from '@/pages/DashboardPage';
import { renderWithProviders } from './testUtils';
import { setCredentials } from '@/store/slices/authSlice';
import type { AuthResponse } from '@/types';

const mockAuth: AuthResponse = {
  userId: 'user-1',
  email: 'alex.morgan@example.com',
  username: 'alex_morgan',
  roles: ['ROLE_LEARNER'],
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  expiresIn: 3600,
  tokenType: 'Bearer',
};

describe('DashboardPage', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('greets the user and renders stat widgets', async () => {
    const { store } = renderWithProviders(<DashboardPage />);
    store.dispatch(setCredentials(mockAuth));

    expect(await screen.findByText('Sessions Completed')).toBeInTheDocument();
    expect(screen.getByText('Learning Hours')).toBeInTheDocument();
    expect(screen.getByText('Credits Earned')).toBeInTheDocument();
    expect(screen.getByText('Mentor Rating')).toBeInTheDocument();
  });

  it('renders the learning progress chart and profile completion', async () => {
    const { store } = renderWithProviders(<DashboardPage />);
    store.dispatch(setCredentials(mockAuth));

    expect(await screen.findByText('Learning Progress')).toBeInTheDocument();
    expect(screen.getByText('Profile Completion')).toBeInTheDocument();
  });

  it('renders sessions, wallet, activity and notifications widgets', async () => {
    const { store } = renderWithProviders(<DashboardPage />);
    store.dispatch(setCredentials(mockAuth));

    expect(await screen.findByText('Upcoming Sessions')).toBeInTheDocument();
    expect(screen.getByText('Wallet Balance')).toBeInTheDocument();
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('Recent Reviews')).toBeInTheDocument();
    expect(screen.getByText('Recommended Mentors')).toBeInTheDocument();
    expect(screen.getByText('Community Activity')).toBeInTheDocument();
  });
});
