import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentsPage } from '@/pages/admin/PaymentsPage';
import { renderWithProviders } from './testUtils';

describe('PaymentsPage', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders the header, KPIs and revenue chart', async () => {
    renderWithProviders(<PaymentsPage />);

    expect(await screen.findByText('Payments')).toBeInTheDocument();
    expect(screen.getByText('Gross revenue')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Pending refunds')).toBeInTheDocument();
    expect(screen.getByText('Revenue Trend')).toBeInTheDocument();
  });

  it('renders all section tabs with honest zero counts', async () => {
    renderWithProviders(<PaymentsPage />);

    expect(await screen.findByRole('tab', { name: 'Transactions (0)' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Refunds (0)' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Subscriptions (0)' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Coupons (0)' })).toBeInTheDocument();
  });

  it('switches to refunds and shows the honest empty state', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PaymentsPage />);

    await user.click(await screen.findByRole('tab', { name: 'Refunds (0)' }));

    expect(await screen.findByText('No records found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search or filters.')).toBeInTheDocument();
  });

  it('searches transactions and keeps the empty state without results', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PaymentsPage />);

    const search = await screen.findByPlaceholderText('Search transactions…');
    await user.type(search, 'Emma');

    expect(await screen.findByText('No records found')).toBeInTheDocument();
  });
});
