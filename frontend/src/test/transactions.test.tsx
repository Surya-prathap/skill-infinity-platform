import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { TransactionHistoryPage } from '@/pages/TransactionHistoryPage';
import { renderWithProviders } from './testUtils';

describe('TransactionHistoryPage', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders the transaction timeline with an honest empty state', async () => {
    renderWithProviders(<TransactionHistoryPage />);

    expect(await screen.findByText('Wallet transactions')).toBeInTheDocument();
    // No fabricated transaction rows — the page shows a real empty state.
    expect(await screen.findByText('No transactions found')).toBeInTheDocument();
  });

  it('switches to the payments tab', async () => {
    renderWithProviders(<TransactionHistoryPage />);

    fireEvent.click(await screen.findByText('Payments'));

    expect(await screen.findByText('No transactions found')).toBeInTheDocument();
  });

  it('keeps the search box and filter available', async () => {
    renderWithProviders(<TransactionHistoryPage />);

    const search = await screen.findByPlaceholderText('Search transactions…');
    fireEvent.change(search, { target: { value: 'Alex' } });

    expect(search).toHaveValue('Alex');
    expect(await screen.findByText('No transactions found')).toBeInTheDocument();
  });
});
