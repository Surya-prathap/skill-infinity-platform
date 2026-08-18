import { useMemo } from 'react';
import { useUpcomingSessionsQuery, useSessionHistoryQuery } from '@/features/sessions';
import { useWalletBalanceQuery } from '@/features/wallet';
import { useMentorSearch } from '@/features/marketplace';
import dayjs from 'dayjs';

/** Chart point used by AreaChart / BarChart. */
export interface ChartPoint {
  label: string;
  value: number;
}

/**
 * Aggregates every dashboard widget from the real backend services:
 * upcoming sessions, session history (stats + weekly progress), wallet
 * balance, top-rated mentors and top reviews.
 */
export const useDashboardData = () => {
  // Every dashboard widget renders instantly with placeholder data (emptyPage
  // / ?? 0) and fills in as responses arrive — so all of these background
  // fetches are marked `silent` and never drive the global loading bar. The
  // bar is reserved for user-initiated work (login, mutations, navigations).
  const upcoming = useUpcomingSessionsQuery(0, 10, { silent: true });
  // 50 recent sessions is plenty for the stats + 8-week progress chart and
  // keeps the dashboard payload small.
  const history = useSessionHistoryQuery(0, 50, { silent: true });
  const wallet = useWalletBalanceQuery({ silent: true });
  const mentors = useMentorSearch({
    page: 0,
    size: 4,
    sortBy: 'RATING',
    sortDirection: 'DESC',
  });

  const sessions = history.data.content;
  const completed = sessions.filter((session) => session.status === 'COMPLETED');
  const upcomingSessions = upcoming.data.content;

  /* ---------------- Derived stats ---------------- */
  const learningHours = completed.reduce(
    (total, session) => total + (session.durationMinutes ?? 0),
    0,
  ) / 60;

  const stats = useMemo(
    () => [
      {
        label: 'Sessions Completed',
        value: completed.length,
        suffix: '',
        delta: `${upcomingSessions.length} upcoming`,
        color: '#6D5DF6',
      },
      {
        label: 'Learning Hours',
        value: learningHours,
        suffix: 'h',
        decimals: 1,
        delta: 'From completed sessions',
        color: '#14B8A6',
      },
      {
        label: 'Wallet Balance',
        value: wallet.balance?.currentBalance ?? 0,
        suffix: '',
        delta: 'Credits available',
        color: '#F59E0B',
      },
      {
        label: 'Upcoming Sessions',
        value: upcomingSessions.length,
        suffix: '',
        delta: 'Next 7 days',
        color: '#EC4899',
      },
    ],
    [completed.length, learningHours, upcomingSessions.length, wallet.balance],
  );

  /* ---------------- Weekly learning progress (last 8 weeks) ---------------- */
  const learningProgress = useMemo<ChartPoint[]>(() => {
    const now = dayjs();
    const buckets: ChartPoint[] = [];
    for (let week = 7; week >= 0; week -= 1) {
      const start = now.subtract(week, 'week').startOf('week');
      const end = start.add(1, 'week');
      const count = completed.filter((session) => {
        if (!session.completedAt && !session.endTime) return false;
        const at = dayjs(session.completedAt ?? session.endTime);
        return at.isAfter(start) && at.isBefore(end);
      }).length;
      buckets.push({ label: `W${8 - week}`, value: count });
    }
    return buckets;
  }, [completed]);

  const isOffline =
    upcoming.isError || history.isError || wallet.isError || mentors.isError;

  return {
    stats,
    learningProgress,
    upcomingSessions,
    isOffline,
    // Raw query results for panels that render items directly.
    upcomingQuery: upcoming,
    historyQuery: history,
    walletQuery: wallet,
    mentorsQuery: mentors,
  };
};
