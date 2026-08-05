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

  it('renders all section tabs with counts', async () => {
    renderWithProviders(<PaymentsPage />);

    expect(await screen.findByRole('tab', { name: 'Transactions (18)' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Refunds (5)' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Subscriptions (6)' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Coupons (5)' })).toBeInTheDocument();
  });

  it('switches to refunds and shows pending refund approvals', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PaymentsPage />);

    await user.click(await screen.findByRole('tab', { name: 'Refunds (5)' }));

    expect(await screen.findByText('Chloe Martin')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Approve/i }).length).toBeGreaterThan(0);
  });

  it('searches transactions by customer name', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PaymentsPage />);

    const search = await screen.findByPlaceholderText('Search transactions…');
    await user.type(search, 'Emma');

    expect(await screen.findByText('Emma Wilson')).toBeInTheDocument();
    expect(screen.queryByText('Sarah Chen')).not.toBeInTheDocument();
  });
});
