import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MentorsPage } from '@/pages/admin/MentorsPage';
import { renderWithProviders } from './testUtils';

/**
 * API calls fail instantly in tests (offline adapter), so the page renders its
 * honest empty states — no fabricated mentor names or counts.
 */
describe('MentorsPage', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders the header, analytics strip and empty approval queue', async () => {
    renderWithProviders(<MentorsPage />);

    expect(await screen.findByText('Mentor Management')).toBeInTheDocument();
    expect(screen.getByText('Rating Distribution')).toBeInTheDocument();
    expect(screen.getByText('Mentor Overview')).toBeInTheDocument();
    expect(screen.getByText('0 awaiting approval')).toBeInTheDocument();
    expect(screen.getByText('All caught up 🎉')).toBeInTheDocument();
  });

  it('shows the approval tabs with zero counts', async () => {
    renderWithProviders(<MentorsPage />);

    expect(await screen.findByRole('tab', { name: 'Approval Queue (0)' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'All Mentors (0)' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Top Mentors' })).toBeInTheDocument();
  });

  it('switches to the all-mentors table and shows the empty state', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MentorsPage />);

    await user.click(await screen.findByRole('tab', { name: 'All Mentors (0)' }));

    expect(await screen.findByText('All mentors (0)')).toBeInTheDocument();
    expect(screen.getByText('No mentors found')).toBeInTheDocument();
  });
});
