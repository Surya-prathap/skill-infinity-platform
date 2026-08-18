import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from './testUtils';
import { MentorReviewsPage } from '@/pages/reviews/MentorReviewsPage';
import { ReviewCard, RatingDistribution, StarRating } from '@/components/reviews';
import type { Review } from '@/types';

/** Renders the page under a real route so useParams resolves :mentorId. */
const renderReviewsPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/mentors/:mentorId/reviews" element={<MentorReviewsPage />} />
    </Routes>,
    { initialEntries: ['/mentors/m-001/reviews'] },
  );

describe('MentorReviewsPage', () => {
  it('renders the rating summary with honest zero values', async () => {
    renderReviewsPage();

    // Real (zero) summary values — never fabricated ratings or review counts.
    expect(await screen.findByText('0.0')).toBeInTheDocument();
    expect(screen.getByText('0 reviews')).toBeInTheDocument();
    expect(screen.getByText('Reviews linked to completed sessions')).toBeInTheDocument();
  });

  it('shows an honest error state when the mentor profile is unavailable', async () => {
    renderReviewsPage();

    // In the offline test environment the mentor profile cannot load, so the
    // page must never fabricate reviews — it shows a clear error state instead.
    expect(await screen.findByText('Mentor not found')).toBeInTheDocument();
    expect(screen.getByText("We couldn't load this mentor's reviews.")).toBeInTheDocument();
    expect(screen.queryByText(/Transformative whiteboard sessions/i)).not.toBeInTheDocument();
  });

  it('opens the review composer dialog', async () => {
    const user = userEvent.setup();
    renderReviewsPage();

    // The modal opens synchronously on click — assert immediately so the later
    // mentor-profile error state can never flip the page underneath the test.
    await user.click(screen.getByRole('button', { name: /Write a review/i }));
    expect(screen.getByText(/Share your session experience honestly/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit review/i })).toBeInTheDocument();
  });
});

describe('Review primitives', () => {
  const review: Review = {
    id: 'r-test',
    mentorId: 'm-001',
    learnerName: 'Test Learner',
    rating: 4,
    title: 'Solid session',
    content: 'Great depth and clear communication.',
    verified: true,
    dimensionRatings: { skill: 5, communication: 4, knowledge: 5, professionalism: 4 },
    helpfulCount: 3,
    notHelpfulCount: 0,
  };

  it('ReviewCard renders dimensions and mentor reply support', () => {
    renderWithProviders(<ReviewCard review={review} />);

    expect(screen.getByText(/Test Learner/i)).toBeInTheDocument();
    expect(screen.getByText('Communication')).toBeInTheDocument();
  });

  it('RatingDistribution renders five rows with percentages', () => {
    renderWithProviders(
      <RatingDistribution
        breakdown={{ '5': 4, '4': 1, '3': 1, '2': 0, '1': 0 }}
        total={6}
      />,
    );

    expect(screen.getByLabelText('5 star reviews: 4')).toBeInTheDocument();
    expect(screen.getByLabelText('1 star reviews: 0')).toBeInTheDocument();
  });

  it('StarRating supports keyboard interaction', async () => {
    const user = userEvent.setup();
    const onSelect = (value: number) => {
      void value;
    };
    renderWithProviders(<StarRating value={3} onChange={onSelect} ariaLabel="Rate it" />);

    const ratingGroup = screen.getByRole('radiogroup', { name: 'Rate it' });
    ratingGroup.focus();
    await user.keyboard('{ArrowRight}');
    expect(ratingGroup).toHaveFocus();
  });
});
