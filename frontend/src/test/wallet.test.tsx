import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import { WalletPage } from '@/pages/WalletPage';
import { renderWithProviders } from './testUtils';

describe('WalletPage', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders the balance hero and action buttons', async () => {
    renderWithProviders(<WalletPage />);

    expect(await screen.findByText('Available balance')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buy credits/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /transactions/i })).toBeInTheDocument();
  });

  it('renders the statistics metric cards', async () => {
    renderWithProviders(<WalletPage />);

    expect(await screen.findByText('Credits purchased')).toBeInTheDocument();
    expect(screen.getByText('Credits used')).toBeInTheDocument();
    expect(screen.getByText('Active days')).toBeInTheDocument();
    // "Transactions" appears on the metric card and the page header — both should exist.
    expect(screen.getAllByText('Transactions').length).toBeGreaterThan(0);
  });

  it('renders charts and honest empty states when the API is offline', async () => {
    renderWithProviders(<WalletPage />);

    expect(await screen.findByText('Monthly spending')).toBeInTheDocument();
    expect(screen.getByText('Spending split')).toBeInTheDocument();
    expect(screen.getByText('Recent transactions')).toBeInTheDocument();
    // No fabricated transactions or spending breakdowns — real empty states only.
    expect(screen.getByText('No spending data yet.')).toBeInTheDocument();
    expect(await screen.findByText('No transactions yet')).toBeInTheDocument();
  });
});
