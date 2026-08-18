import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { SessionsPage } from '@/pages/SessionsPage';
import { renderWithProviders } from './testUtils';

describe('SessionsPage', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders the upcoming sessions tab with an honest empty state', async () => {
    renderWithProviders(<SessionsPage />);

    // No dummy data — offline renders the real empty state.
    expect(await screen.findByText('Upcoming (0)')).toBeInTheDocument();
    expect(await screen.findByText('No upcoming sessions')).toBeInTheDocument();
  });

  it('switches to the session history tab', async () => {
    renderWithProviders(<SessionsPage />);

    fireEvent.click(await screen.findByText('History (0)'));

    expect(await screen.findByText('No session history yet')).toBeInTheDocument();
  });

  it('renders the quick stats strip from real data (zero by default)', async () => {
    renderWithProviders(<SessionsPage />);

    expect(await screen.findByText(/Upcoming: 0/)).toBeInTheDocument();
    expect(screen.getByText(/Completed: 0/)).toBeInTheDocument();
    expect(screen.getByText(/Cancelled: 0/)).toBeInTheDocument();
  });
});
