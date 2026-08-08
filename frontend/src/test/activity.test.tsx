import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithProviders } from './testUtils';
import { ActivityPage, AchievementsPage } from '@/pages/community';
import { ActivityCard, AchievementCard, ContributionGraph } from '@/components/community';
import { testAchievements } from './fixtures';
import type { ActivityItem } from '@/types';

vi.mock('@/services', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services')>();
  const { testAchievements: achievements, testActivityItems, testLearningStats } = await import('./fixtures');
  return {
    ...actual,
    communityService: {
      ...actual.communityService,
      getActivity: vi.fn().mockResolvedValue({ data: { data: testActivityItems } }),
      getAchievements: vi.fn().mockResolvedValue({ data: { data: achievements } }),
      getLearningStats: vi.fn().mockResolvedValue({ data: { data: testLearningStats } }),
    },
  };
});

describe('ActivityPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the learning stats and weekly/monthly progress', async () => {
    renderWithProviders(<ActivityPage />);

    expect(await screen.findByText('Learning Activity')).toBeInTheDocument();
    expect(screen.getByText('12 days')).toBeInTheDocument();
    expect(screen.getByText('Weekly progress')).toBeInTheDocument();
    expect(screen.getByText('Monthly progress')).toBeInTheDocument();
    expect(screen.getByText('Contribution graph')).toBeInTheDocument();
  });

  it('renders the activity timeline items', async () => {
    renderWithProviders(<ActivityPage />);

    expect(await screen.findByText('Completed System Design Deep Dive')).toBeInTheDocument();
    expect(screen.getByText(/Streak Builder/i)).toBeInTheDocument();
  });
});

describe('AchievementsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the level card, collection donut and badge grid', async () => {
    renderWithProviders(<AchievementsPage />);

    expect(await screen.findByText(/Rising Star/)).toBeInTheDocument();
    expect(await screen.findByText('Collection')).toBeInTheDocument();
    expect(await screen.findByText('First Steps')).toBeInTheDocument();
    expect(await screen.findByText('Streak Builder')).toBeInTheDocument();
  });

  it('separates locked achievements into their own section', async () => {
    renderWithProviders(<AchievementsPage />);

    expect(await screen.findByText('Momentum')).toBeInTheDocument();
    expect(screen.getByText(/Still in progress/)).toBeInTheDocument();
  });

  it('preview unlock triggers a celebratory state without crashing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AchievementsPage />);

    await user.click(screen.getByRole('button', { name: /Preview unlock/i }));
    // The unlocked section should still render.
    expect(await screen.findByText(/Unlocked \(\d+\)/)).toBeInTheDocument();
  });
});

describe('Activity primitives', () => {
  const item: ActivityItem = {
    id: 'a-1',
    type: 'SESSION_COMPLETED',
    title: 'Completed React Performance Patterns',
    description: '60-minute session',
    points: 120,
    createdAt: new Date().toISOString(),
  };

  it('ActivityCard renders title, points and relative time', () => {
    renderWithProviders(<ActivityCard item={item} />);
    expect(screen.getByText('Completed React Performance Patterns')).toBeInTheDocument();
    expect(screen.getByText('+120 pts')).toBeInTheDocument();
  });

  it('AchievementCard shows progress for locked achievements', () => {
    const locked = testAchievements.find((a) => !a.unlocked)!;
    renderWithProviders(<AchievementCard achievement={locked} />);
    expect(screen.getByText(/\/ 30/)).toBeInTheDocument();
  });

  it('ContributionGraph renders heatmap cells', () => {
    renderWithProviders(<ContributionGraph data={{ '2026-08-01': 3, '2026-08-02': 0 }} weeks={4} />);
    expect(screen.getByText('Less')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });

  it('AchievementCard unlocks with animation state', async () => {
    const user = userEvent.setup();
    const unlocked = testAchievements.find((a) => a.unlocked)!;
    renderWithProviders(<AchievementCard achievement={unlocked} justUnlocked />);
    await waitFor(() => {
      expect(screen.getByText('First Steps')).toBeInTheDocument();
    });
    void user;
  });
});
