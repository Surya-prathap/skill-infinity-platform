import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { MentorPricingPage } from '@/pages/mentor/MentorPricingPage';
import { renderWithProviders } from './testUtils';

describe('MentorPricingPage', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders the header, stats and plan sections', async () => {
    renderWithProviders(<MentorPricingPage />);

    expect(await screen.findByText('Pricing')).toBeInTheDocument();
    expect(await screen.findByText('Pricing Plans')).toBeInTheDocument();
    expect(await screen.findByText('Learner Preview')).toBeInTheDocument();
    expect(await screen.findByText('Discount rules')).toBeInTheDocument();
  });

  it('renders the seed pricing plans', async () => {
    renderWithProviders(<MentorPricingPage />);

    // The featured plan also appears in the learner preview, so duplicates are expected.
    expect((await screen.findAllByText('1:1 Mentoring')).length).toBeGreaterThan(0);
    expect(await screen.findByText('Interview Prep')).toBeInTheDocument();
    expect(await screen.findByText('Code Review')).toBeInTheDocument();
  });

  it('opens the pricing editor to create a plan', async () => {
    renderWithProviders(<MentorPricingPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'New plan' }));

    expect(await screen.findByText('Add pricing plan')).toBeInTheDocument();
    expect(await screen.findByLabelText(/Session type/)).toBeInTheDocument();
  });
});
