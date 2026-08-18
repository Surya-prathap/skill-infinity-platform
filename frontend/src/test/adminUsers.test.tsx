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

  it('renders the header, stats strip and empty state', async () => {
    renderWithProviders(<UsersPage />);

    expect(await screen.findByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('Total users')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Suspended')).toBeInTheDocument();
    // No users exist in the backend yet, so an honest empty state is shown.
    expect(await screen.findByText('No users match your filters')).toBeInTheDocument();
  });

  it('searches without results and keeps the empty state', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersPage />);

    const search = await screen.findByPlaceholderText('Search name, email, role…');
    await user.type(search, 'Priya');

    await waitFor(() => {
      expect(screen.getByText('No users match your filters')).toBeInTheDocument();
    });
  });

  it('opens the filter drawer', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersPage />);

    await user.click(await screen.findByRole('button', { name: 'Open filters' }));
    expect(await screen.findByText('Filter users')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Mentor' }));
    await user.click(screen.getByRole('button', { name: 'Apply filters' }));

    await waitFor(() => {
      // No seed users exist, so filtering still yields the empty state.
      expect(screen.getByText('No users match your filters')).toBeInTheDocument();
    });
  });
});
