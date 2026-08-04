import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { SessionsPage } from '@/pages/SessionsPage';
import { renderWithProviders } from './testUtils';

describe('SessionsPage', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders upcoming sessions from seed data', async () => {
    renderWithProviders(<SessionsPage />);

    expect(await screen.findByText('Upcoming (3)')).toBeInTheDocument();
    expect(screen.getByText('System Design Deep Dive')).toBeInTheDocument();
  });

  it('switches to the session history tab', async () => {
    renderWithProviders(<SessionsPage />);

    fireEvent.click(await screen.findByText('History (3)'));

    expect(await screen.findByText('Cloud Fundamentals')).toBeInTheDocument();
    expect(screen.getByText(/Backend Architecture Review/)).toBeInTheDocument();
  });

  it('renders the quick stats strip', async () => {
    renderWithProviders(<SessionsPage />);

    expect(await screen.findByText(/Upcoming: 3/)).toBeInTheDocument();
    expect(screen.getByText(/Completed: 2/)).toBeInTheDocument();
  });
});
