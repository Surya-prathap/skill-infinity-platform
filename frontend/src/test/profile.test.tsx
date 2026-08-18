import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import { ProfileOverviewPage } from '@/pages/profile/ProfileOverviewPage';
import { renderWithProviders } from './testUtils';
import { setCredentials } from '@/store/slices/authSlice';
import { persistProfile } from '@/features/profile/storage';
import { testProfile } from './fixtures';
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

describe('ProfileOverviewPage', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders the profile identity and headline from the persisted profile', async () => {
    persistProfile(testProfile);
    const { store } = renderWithProviders(<ProfileOverviewPage />);
    store.dispatch(setCredentials(mockAuth));

    // The cached profile is shown while the API is unreachable.
    expect(await screen.findByText('Alex Morgan')).toBeInTheDocument();
    expect(screen.getByText('Senior Frontend Engineer · Design Systems & Performance')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Profile Completion')).toBeInTheDocument();
  });

  it('renders skills chips', async () => {
    persistProfile(testProfile);
    const { store } = renderWithProviders(<ProfileOverviewPage />);
    store.dispatch(setCredentials(mockAuth));

    expect(await screen.findByText('Skills')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });
});
