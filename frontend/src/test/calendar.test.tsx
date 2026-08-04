import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import { CalendarPage } from '@/pages/CalendarPage';
import { renderWithProviders } from './testUtils';

describe('CalendarPage', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders the calendar header and schedule panel', async () => {
    renderWithProviders(<CalendarPage />);

    expect(await screen.findByText('Session schedule')).toBeInTheDocument();
    expect(screen.getByText('Export ICS')).toBeInTheDocument();
    expect(screen.getByText('Book session')).toBeInTheDocument();
  });

  it('shows seed calendar events', async () => {
    renderWithProviders(<CalendarPage />);

    expect(await screen.findByText('System Design Deep Dive')).toBeInTheDocument();
  });
});
