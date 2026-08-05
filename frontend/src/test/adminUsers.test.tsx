import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UsersPage } from '@/pages/admin/UsersPage';
import { renderWithProviders } from './testUtils';

describe('UsersPage', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders the header, stats strip and user table', async () => {
    renderWithProviders(<UsersPage />);

    expect(await screen.findByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('Total users')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Suspended')).toBeInTheDocument();
    expect(await screen.findByText('All users (24)')).toBeInTheDocument();
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
  });

  it('searches users by name', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersPage />);

    const search = await screen.findByPlaceholderText('Search name, email, role…');
    await user.type(search, 'Priya');

    await waitFor(() => {
      expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    });
    expect(screen.queryByText('Sarah Chen')).not.toBeInTheDocument();
  });

  it('opens the filter drawer and applies a role filter', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersPage />);

    await user.click(await screen.findByRole('button', { name: 'Open filters' }));
    expect(await screen.findByText('Filter users')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Mentor' }));
    await user.click(screen.getByRole('button', { name: 'Apply filters' }));

    await waitFor(() => {
      // Only ROLE_MENTOR users remain (Alex Rivera, Emma Wilson, …).
      expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
      expect(screen.queryByText('Sarah Chen')).not.toBeInTheDocument();
    });
  });

  it('opens the user drawer when a row is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersPage />);

    await user.click(await screen.findByText('Sarah Chen'));

    expect(await screen.findByRole('heading', { name: /Sarah Chen/i })).toBeInTheDocument();
  });
});
