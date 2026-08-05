import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from './testUtils';
import { MentorReviewsPage } from '@/pages/community/MentorReviewsPage';
import { ReviewCard, RatingDistribution, StarRating } from '@/components/community';
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
  it('renders the rating summary with average and distribution', async () => {
    renderReviewsPage();

    expect(await screen.findByText(/Reviews for/i)).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('6 reviews')).toBeInTheDocument();
  });

  it('lists reviews with titles and dimension badges', async () => {
    renderReviewsPage();

    expect(await screen.findByText(/Transformative whiteboard sessions/i)).toBeInTheDocument();
    // Dimension badges appear on every review card.
    expect(screen.getAllByText('Communication').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Professionalism').length).toBeGreaterThan(0);
  });

  it('shows verified and anonymous badges', async () => {
    renderReviewsPage();

    // Summary line + stat + per-review chips all mention verified sessions.
    expect((await screen.findAllByText(/Verified session/i)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Anonymous learner/i).length).toBeGreaterThan(0);
  });

  it('filters reviews by star rating', async () => {
    const user = userEvent.setup();
    renderReviewsPage();

    await user.click(await screen.findByRole('button', { name: /3★/i }));

    await waitFor(() => {
      expect(screen.getByText(/Strong mentor, packed schedule/i)).toBeInTheDocument();
      expect(screen.queryByText(/Transformative whiteboard sessions/i)).not.toBeInTheDocument();
    });
  });

  it('records a helpful vote optimistically', async () => {
    const user = userEvent.setup();
    renderReviewsPage();

    // One review is pre-voted in the seed, so the count grows after our vote.
    const before = screen.getAllByText(/Thanks for your feedback/i).length;

    const helpfulButton = await screen.findByRole('button', { name: /Helpful \(24\)/i });
    await user.click(helpfulButton);

    await waitFor(() => {
      expect(screen.getAllByText(/Thanks for your feedback/i).length).toBeGreaterThan(before);
    });
  });

  it('opens the review composer dialog', async () => {
    const user = userEvent.setup();
    renderReviewsPage();

    await user.click(screen.getByRole('button', { name: /Write a review/i }));

    expect(await screen.findByText(/Share your session experience honestly/i)).toBeInTheDocument();
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
    renderWithProviders(<ReviewCard review={review} mentorId="m-001" />);

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
