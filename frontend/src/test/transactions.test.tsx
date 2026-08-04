import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { TransactionHistoryPage } from '@/pages/TransactionHistoryPage';
import { renderWithProviders } from './testUtils';

describe('TransactionHistoryPage', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders the transaction timeline with wallet rows', async () => {
    renderWithProviders(<TransactionHistoryPage />);

    expect(await screen.findByText('Wallet transactions')).toBeInTheDocument();
    expect(screen.getByText('Credit top-up — Pro Pack')).toBeInTheDocument();
    expect(screen.getByText('Session with Alex Rivera')).toBeInTheDocument();
  });

  it('switches to the payments tab', async () => {
    renderWithProviders(<TransactionHistoryPage />);

    fireEvent.click(await screen.findByText('Payments'));

    expect(await screen.findByText('Credit top-up — Pro Pack')).toBeInTheDocument();
  });

  it('filters transactions by search term', async () => {
    renderWithProviders(<TransactionHistoryPage />);

    const search = await screen.findByPlaceholderText('Search transactions…');
    fireEvent.change(search, { target: { value: 'Alex' } });

    expect(screen.getByText('Session with Alex Rivera')).toBeInTheDocument();
    expect(screen.queryByText('Credit top-up — Pro Pack')).not.toBeInTheDocument();
  });
});
