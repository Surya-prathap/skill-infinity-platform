import { describe, expect, it, afterEach, vi } from 'vitest';
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { BookingWizard } from '@/components/booking/BookingWizard';
import { renderWithProviders } from './testUtils';
import { seedMentors } from '@/features/marketplace/data';
import type { BookingRequest } from '@/types';

const mentor = seedMentors[0];
const pricing = mentor.pricingList ?? [];

const stepContent = async (text: string): Promise<void> => {
  await waitFor(() => expect(screen.queryByText(text)).not.toBeNull(), { timeout: 15000 });
};

describe('BookingWizard', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  const renderWizard = (onSubmit: (request: BookingRequest) => Promise<void> | void = () => undefined) =>
    renderWithProviders(
      <BookingWizard
        mentor={mentor}
        name={mentor.profile?.headline?.split('·')[0]?.trim()}
        pricing={pricing}
        learnerId="user-1"
        learnerName="Alex Morgan"
        onSubmit={onSubmit}
      />,
    );

  it('renders the stepper with mentor step and pricing', async () => {
    renderWizard();

    expect(await screen.findByText(/years/i)).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Payment')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('advances to session type selection and back to the mentor step', async () => {
    renderWizard();

    fireEvent.click(await screen.findByRole('button', { name: /continue/i }));
    await stepContent('Choose a session type');

    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    await waitFor(() => expect(screen.queryByText(/years/i)).not.toBeNull(), { timeout: 15000 });
  });

  it('submits the booking request through the wizard', async () => {
    const onSubmit = vi.fn<(request: BookingRequest) => Promise<void>>(async () => undefined);
    renderWizard(onSubmit);

    // Step 1 — select the first pricing plan (role=radio).
    fireEvent.click(await screen.findByRole('button', { name: /continue/i }));
    await stepContent('Choose a session type');
    const plans = await screen.findAllByRole('radio');
    fireEvent.click(plans[0]);

    // Step 2 — pick the first available date.
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    await stepContent('Pick a date');
    const dateButtons = await screen.findAllByRole('button');
    const dateButton = dateButtons.find((button) => {
      const text = button.textContent?.trim() ?? '';
      return /\d/.test(text) && text.length <= 9 && text !== 'Back' && text !== 'Continue';
    });
    expect(dateButton).toBeTruthy();
    fireEvent.click(dateButton as HTMLElement);

    // Step 3 — pick the first time slot.
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    await stepContent('Choose a time slot');
    const slotButtons = await screen.findAllByRole('button');
    const slotButton = slotButtons.find((button) =>
      /^\d{1,2}:\d{2} [AP]M$/.test(button.textContent?.trim() ?? ''),
    );
    expect(slotButton).toBeTruthy();
    fireEvent.click(slotButton as HTMLElement);

    // Step 4 — review and confirm.
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    await stepContent('Review & pay with wallet credits');
    fireEvent.click(screen.getByRole('button', { name: /confirm & book/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1), { timeout: 15000 });
    const request = onSubmit.mock.calls[0]?.[0];
    expect(request).toBeDefined();
    expect(request?.mentorId).toBe(mentor.id);
    expect(request?.learnerName).toBe('Alex Morgan');
  });
});
