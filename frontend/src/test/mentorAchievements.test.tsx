import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { MentorAchievementsPage } from '@/pages/mentor/MentorAchievementsPage';
import { renderWithProviders } from './testUtils';

describe('MentorAchievementsPage', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders the header and type summary cards', async () => {
    renderWithProviders(<MentorAchievementsPage />);

    expect(await screen.findByText('Achievements')).toBeInTheDocument();
    expect(await screen.findByText('Badges')).toBeInTheDocument();
    expect(await screen.findByText('Awards')).toBeInTheDocument();
    expect(await screen.findByText('Milestones')).toBeInTheDocument();
    expect(await screen.findByText('Highlights')).toBeInTheDocument();
  });

  it('renders the achievement cards with seed data', async () => {
    renderWithProviders(<MentorAchievementsPage />);

    expect(await screen.findByText('All Achievements')).toBeInTheDocument();
    // Achievements appear in both the cards grid and the timeline.
    expect((await screen.findAllByText('Top 1% Mentor on Skill Infinity')).length).toBeGreaterThan(
      0,
    );
    expect((await screen.findAllByText('200+ Learners Mentored')).length).toBeGreaterThan(0);
    expect(await screen.findByText('Achievement Timeline')).toBeInTheDocument();
  });

  it('filters achievements by type', async () => {
    renderWithProviders(<MentorAchievementsPage />);

    const badgeChip = await screen.findByRole('button', { name: 'Badge' });
    fireEvent.click(badgeChip);

    expect((await screen.findAllByText('5.0 Rating Streak — 6 Months')).length).toBeGreaterThan(0);
    // The AWARD is filtered out of the grid — it only remains in the timeline (single occurrence).
    await waitFor(() => {
      expect(screen.getAllByText('Top 1% Mentor on Skill Infinity')).toHaveLength(1);
    });
  });

  it('opens the add-achievement editor', async () => {
    renderWithProviders(<MentorAchievementsPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Add achievement' }));

    expect(await screen.findByText('Add an achievement')).toBeInTheDocument();
    expect(await screen.findByLabelText(/Title/)).toBeInTheDocument();
  });
});
