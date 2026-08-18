import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import { MentorAvailabilityPage } from '@/pages/mentor/MentorAvailabilityPage';
import { renderWithProviders } from './testUtils';

describe('MentorAvailabilityPage', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders the header, controls and weekly schedule', async () => {
    renderWithProviders(<MentorAvailabilityPage />);

    expect(await screen.findByText('Availability')).toBeInTheDocument();
    expect((await screen.findAllByText('Timezone')).length).toBeGreaterThan(0);
    expect(await screen.findByText('Weekly Schedule')).toBeInTheDocument();
  });

  it('shows an honest empty state when no availability is configured yet', async () => {
    renderWithProviders(<MentorAvailabilityPage />);

    expect(
      await screen.findByText(
        'No availability configured yet. Add your first time slot to start receiving booking requests.',
      ),
    ).toBeInTheDocument();
  });

  it('offers the add-time-slot action', async () => {
    renderWithProviders(<MentorAvailabilityPage />);

    expect(await screen.findByRole('button', { name: 'Add time slot' })).toBeInTheDocument();
  });
});
