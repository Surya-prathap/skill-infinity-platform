import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { MentorsPage } from '@/pages/MentorsPage';
import { renderWithProviders } from './testUtils';

describe('MentorsPage (marketplace)', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders the hero, search and trending skills', async () => {
    renderWithProviders(<MentorsPage />);

    expect(await screen.findByText('Find your perfect mentor')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search by skill, topic or mentor…')).toBeInTheDocument();
    expect(screen.getByText('Trending:')).toBeInTheDocument();
  });

  it('renders mentor cards from the seed catalog', async () => {
    renderWithProviders(<MentorsPage />);

    // "Staff Engineer" is unique to the m-001 mentor card (not in trending chips).
    const staffEngineers = await screen.findAllByText('Staff Engineer');
    expect(staffEngineers.length).toBeGreaterThan(0);
    expect(await screen.findByText('Trending mentors')).toBeInTheDocument();
  });

  it('lets the user save a mentor and view saved mentors', async () => {
    renderWithProviders(<MentorsPage />);

    // Cards render under parallel test load — wait generously.
    await waitFor(
      () => {
        expect(screen.getAllByRole('button', { name: /save mentor/i }).length).toBeGreaterThan(0);
      },
      { timeout: 15000 },
    );

    fireEvent.click(screen.getAllByRole('button', { name: /save mentor/i })[0]);

    // The toolbar toggle exposes its tooltip text as the accessible name.
    const savedToggle = await screen.findByRole('button', { name: /show saved mentors/i });
    fireEvent.click(savedToggle);

    // The saved card is now the only result, with a "remove" affordance.
    await waitFor(
      () => {
        expect(screen.getAllByRole('button', { name: /remove from saved mentors/i }).length).toBe(1);
      },
      { timeout: 15000 },
    );
  });
});
