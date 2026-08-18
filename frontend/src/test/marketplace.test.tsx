import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { MentorsPage } from '@/pages/MentorsPage';
import { renderWithProviders } from './testUtils';

describe('MentorsPage (marketplace)', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders the hero and search', async () => {
    renderWithProviders(<MentorsPage />);

    expect(await screen.findByText('Find your perfect mentor')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search by skill, topic or mentor…')).toBeInTheDocument();
  });

  it('shows an honest empty state when no mentors exist yet', async () => {
    renderWithProviders(<MentorsPage />);

    // No fabricated mentor catalog — a real empty state instead.
    expect(await screen.findByText('No mentors match your filters')).toBeInTheDocument();
    expect(screen.getByText('Trending mentors')).toBeInTheDocument();
  });

  it('clears filters from the empty state', async () => {
    renderWithProviders(<MentorsPage />);

    const clear = await screen.findByRole('button', { name: 'Clear filters' });
    fireEvent.click(clear);

    expect(screen.getByText('No mentors match your filters')).toBeInTheDocument();
  });
});
