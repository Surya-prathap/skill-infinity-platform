import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WithdrawalsPage } from '@/pages/admin/WithdrawalsPage';

// The offline adapter in vitest.setup makes every request fail instantly, which
// renders the page's offline state deterministically.
const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <WithdrawalsPage />
    </QueryClientProvider>,
  );
};

describe('Admin Withdrawals page', () => {
  it('renders the header and withdrawal rules', () => {
    renderPage();
    expect(screen.getByText('Withdrawals')).toBeInTheDocument();
    expect(screen.getByText(/1 credit = ₹10/)).toBeInTheDocument();
  });

  it('shows the pending filter chip', () => {
    renderPage();
    expect(screen.getByText(/pending/)).toBeInTheDocument();
  });
});
