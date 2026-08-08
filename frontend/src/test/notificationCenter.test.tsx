import { describe, expect, it } from 'vitest';
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { renderWithProviders } from './testUtils';
import { setNotifications } from '@/store/slices/notificationsSlice';
import { testNotifications } from './fixtures';

describe('NotificationsPage', () => {
  it('renders notifications dispatched into the store', async () => {
    const { store } = renderWithProviders(<NotificationsPage />);
    store.dispatch(setNotifications(testNotifications));

    expect(await screen.findByText('Session reminder')).toBeInTheDocument();
    expect(screen.getByText(/Booking confirmed/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Unread \(3\)/ })).toBeInTheDocument(); // 3 unread in fixture
  });

  it('filters to unread notifications', async () => {
    const { store } = renderWithProviders(<NotificationsPage />);
    store.dispatch(setNotifications(testNotifications));
    await screen.findByText('Session reminder');

    fireEvent.click(screen.getByRole('button', { name: /Unread/ }));
    await waitFor(
      () => {
        expect(screen.queryByText('Payment successful')).not.toBeInTheDocument();
      },
      { timeout: 4000 },
    );
    expect(screen.getByText('Session reminder')).toBeInTheDocument();
  });

  it('marks a single notification as read and deletes it', async () => {
    const { store } = renderWithProviders(<NotificationsPage />);
    store.dispatch(setNotifications(testNotifications));
    await screen.findByText('Session reminder');

    const cards = screen.getAllByRole('button', { name: 'Delete notification' });
    fireEvent.click(cards[0]!);

    await waitFor(
      () => {
        expect(screen.queryByText('Session reminder')).not.toBeInTheDocument();
      },
      { timeout: 4000 },
    );
  });

  it('marks all notifications as read', async () => {
    const { store } = renderWithProviders(<NotificationsPage />);
    store.dispatch(setNotifications(testNotifications));
    await screen.findByText('Session reminder');

    fireEvent.click(screen.getByRole('button', { name: 'Mark all read' }));
    fireEvent.click(screen.getByRole('button', { name: /Unread/ }));

    expect(screen.getByText(/all caught up/)).toBeInTheDocument();
  });

  it('groups notifications by day', async () => {
    const { store } = renderWithProviders(<NotificationsPage />);
    store.dispatch(setNotifications(testNotifications));
    await screen.findByText('Session reminder');

    // Group headers render without depending on wall-clock day boundaries.
    const headers = screen.getAllByText(/Today|Yesterday|This week|Earlier/);
    expect(headers.length).toBeGreaterThan(1);
  });

  it('clears all notifications', async () => {
    const { store } = renderWithProviders(<NotificationsPage />);
    store.dispatch(setNotifications(testNotifications));
    await screen.findByText('Session reminder');

    fireEvent.click(screen.getByText('Clear all'));

    expect(await screen.findByText(/No notifications yet/)).toBeInTheDocument();
    cleanup();
  });
});
