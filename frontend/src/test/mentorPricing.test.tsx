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

  it('shows an honest empty state when no pricing plans exist', async () => {
    renderWithProviders(<MentorPricingPage />);

    // The mentor has no pricing plans in the backend yet, so the empty
    // state is shown instead of fabricated plans.
    expect(
      await screen.findByText(/No pricing plans yet\./),
    ).toBeInTheDocument();
  });

  it('opens the pricing editor to create a plan', async () => {
    renderWithProviders(<MentorPricingPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'New plan' }));

    expect(await screen.findByText('Add pricing plan')).toBeInTheDocument();
    expect(await screen.findByLabelText(/Session type/)).toBeInTheDocument();
  });
});
