import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { MentorRegistrationPage } from '@/pages/mentor/MentorRegistrationPage';
import { renderWithProviders } from './testUtils';

describe('MentorRegistrationPage', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders the wizard header and stepper', async () => {
    renderWithProviders(<MentorRegistrationPage />);

    expect(await screen.findByText('Become a Mentor')).toBeInTheDocument();
    expect(await screen.findByText(/Step 1 of 10/)).toBeInTheDocument();
    expect(await screen.findByText('Application progress')).toBeInTheDocument();
    // "Personal" appears in both the stepper and the requirements strip.
    expect((await screen.findAllByText('Personal')).length).toBeGreaterThan(0);
  });

  it('shows the personal information form on the first step', async () => {
    renderWithProviders(<MentorRegistrationPage />);

    expect(await screen.findByLabelText(/Professional headline/)).toBeInTheDocument();
    expect(await screen.findByLabelText(/Country/)).toBeInTheDocument();
    expect(await screen.findByLabelText(/Short bio/)).toBeInTheDocument();
  });

  it('advances to the experience step after a valid personal form', async () => {
    renderWithProviders(<MentorRegistrationPage />);

    const headline = await screen.findByLabelText(/Professional headline/);
    fireEvent.change(headline, { target: { value: 'Senior Staff Engineer & Mentor' } });

    fireEvent.click(screen.getByRole('button', { name: 'Save & Continue' }));

    expect(await screen.findByText(/Step 2 of 10/)).toBeInTheDocument();
    expect(await screen.findByText('No experience yet')).toBeInTheDocument();
  });
});
