import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from './testUtils';
import { LeaderboardPage } from '@/pages/community/LeaderboardPage';
import { LeaderboardPodium, LeaderboardRow } from '@/components/community';
import type { LeaderboardEntry } from '@/types';

const ENTRY: LeaderboardEntry = {
  id: 'e-1',
  userId: 'u-1',
  name: 'Sarah Chen',
  title: 'Backend Engineer',
  points: 4820,
  metric: '48 sessions',
  change: 2,
  isCurrentUser: false,
};

describe('LeaderboardPage', () => {
  it('renders the podium and ranked list', async () => {
    renderWithProviders(<LeaderboardPage />);

    expect(await screen.findByText('Top Learners')).toBeInTheDocument();
    // Podium shows medal badges and the top learner's name + points.
    expect(screen.getByText('🥇')).toBeInTheDocument();
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    expect(screen.getByText('4,820 pts')).toBeInTheDocument();
  });

  it('switches between ranges', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LeaderboardPage />);

    await user.click(screen.getByRole('button', { name: /Monthly/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Monthly/i })).toHaveClass('MuiButton-contained');
    });
  });

  it('switches categories and shows category label', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LeaderboardPage />);

    await user.click(screen.getByRole('button', { name: /Top Mentors/i }));

    // The selected category chip becomes filled and the MENTORS metric set
    // (28 sessions is unique to MENTORS — LEARNERS rows never show it).
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Top Mentors/i })).toHaveClass('MuiChip-filled');
    });
    expect(screen.getByText(/28 sessions/i)).toBeInTheDocument();
  });
});

describe('Leaderboard components', () => {
  it('LeaderboardRow shows rank, points and movement', () => {
    renderWithProviders(<LeaderboardRow entry={ENTRY} rank={4} />);

    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('4,820 pts')).toBeInTheDocument();
    expect(screen.getByText('48 sessions')).toBeInTheDocument();
  });

  it('LeaderboardPodium highlights the top three', () => {
    const entries: LeaderboardEntry[] = [
      { ...ENTRY, id: 'a', name: 'First', points: 900, change: 0 },
      { ...ENTRY, id: 'b', name: 'Second', points: 800, change: 1 },
      { ...ENTRY, id: 'c', name: 'Third', points: 700, change: -1 },
    ];
    renderWithProviders(<LeaderboardPodium entries={entries} />);

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });
});
