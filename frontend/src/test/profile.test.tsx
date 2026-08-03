import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import { ProfileOverviewPage } from '@/pages/profile/ProfileOverviewPage';
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

describe('ProfileOverviewPage', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders the profile identity and headline from the seeded profile', async () => {
    const { store } = renderWithProviders(<ProfileOverviewPage />);
    store.dispatch(setCredentials(mockAuth));

    // Seed profile data is served while the API is unreachable.
    expect(await screen.findByText('Alex Morgan')).toBeInTheDocument();
    expect(screen.getByText('Senior Frontend Engineer · Design Systems & Performance')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Profile Completion')).toBeInTheDocument();
  });

  it('shows education and experience sections', async () => {
    const { store } = renderWithProviders(<ProfileOverviewPage />);
    store.dispatch(setCredentials(mockAuth));

    expect(await screen.findByText('Education')).toBeInTheDocument();
    expect(screen.getByText('Experience')).toBeInTheDocument();
    expect(screen.getByText('University of Texas at Austin')).toBeInTheDocument();
    expect(screen.getByText('Senior Frontend Engineer · Lumina Labs')).toBeInTheDocument();
  });

  it('renders skills and language chips', async () => {
    const { store } = renderWithProviders(<ProfileOverviewPage />);
    store.dispatch(setCredentials(mockAuth));

    expect(await screen.findByText('Skills')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });
});
