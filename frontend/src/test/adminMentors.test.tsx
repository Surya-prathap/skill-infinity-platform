import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MentorsPage } from '@/pages/admin/MentorsPage';
import { renderWithProviders } from './testUtils';

describe('MentorsPage', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders the header, analytics strip and approval queue', async () => {
    renderWithProviders(<MentorsPage />);

    expect(await screen.findByText('Mentor Management')).toBeInTheDocument();
    expect(screen.getByText('Rating Distribution')).toBeInTheDocument();
    expect(screen.getByText('Mentor Payout Volume (thousands)')).toBeInTheDocument();
    expect(screen.getByText('5 awaiting approval')).toBeInTheDocument();
    // First approval candidate from the seed queue.
    expect(screen.getByText('Oliver Berg')).toBeInTheDocument();
    expect(screen.getByText('Ava Thompson')).toBeInTheDocument();
  });

  it('shows the approval tabs with correct counts', async () => {
    renderWithProviders(<MentorsPage />);

    expect(await screen.findByRole('tab', { name: 'Approval Queue (5)' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'All Mentors (10)' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Top Mentors' })).toBeInTheDocument();
  });

  it('switches to the all-mentors table and searches', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MentorsPage />);

    await user.click(await screen.findByRole('tab', { name: 'All Mentors (10)' }));

    expect(await screen.findByText('All mentors (10)')).toBeInTheDocument();
    expect(screen.getByText('Emma Wilson')).toBeInTheDocument();

    const search = screen.getByPlaceholderText('Search mentors…');
    await user.type(search, 'Ravi');
    await waitFor(() => {
      expect(screen.getByText('Ravi Patel')).toBeInTheDocument();
    });
    expect(screen.queryByText('Emma Wilson')).not.toBeInTheDocument();
  });

  it('opens the approval dialog for a candidate', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MentorsPage />);

    const approveButtons = await screen.findAllByRole('button', { name: /Approve/i });
    await user.click(approveButtons[0]!);

    expect(await screen.findByRole('heading', { name: /Approve mentor/i })).toBeInTheDocument();
  });
});
