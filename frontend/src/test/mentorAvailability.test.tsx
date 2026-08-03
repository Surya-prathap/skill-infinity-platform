import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, fireEvent, screen } from '@testing-library/react';
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
    expect(await screen.findByText('Blocked dates')).toBeInTheDocument();
    expect(await screen.findByText('Weekly Schedule')).toBeInTheDocument();
  });

  it('renders the seed time slots on the calendar', async () => {
    renderWithProviders(<MentorAvailabilityPage />);

    // Seed availability: Mon–Thu + Sat slots, all displayed in 12h format.
    // 09:00–17:00 repeats across two days, so both occurrences are expected.
    expect((await screen.findAllByText('9:00 AM – 5:00 PM')).length).toBeGreaterThan(0);
    expect(await screen.findByText('10:00 AM – 2:00 PM')).toBeInTheDocument();
  });

  it('opens the availability editor to add a new slot', async () => {
    renderWithProviders(<MentorAvailabilityPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Add time slot' }));

    expect(await screen.findByText('Add availability')).toBeInTheDocument();
    expect(await screen.findByLabelText(/Day of week/)).toBeInTheDocument();
  });
});
