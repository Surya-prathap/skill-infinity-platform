import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService, mentorService } from '@/services';
import { getErrorMessage, showError, showInfo, showSuccess } from '@/utils';
import { adminKeys } from './queryKeys';
import { seedDashboard } from './data';
import type {
  AdminAnalytics,
  AdminDashboard,
  AdminCoupon,
  AdminMentor,
  AdminPayment,
  AdminRefund,
  AdminSession,
  AdminSubscription,
  AdminUser,
  AdminWalletTransaction,
  MentorApproval,
  ModerationReview,
  MentorSummary,
  PlatformSetting,
  RevenueAnalytics,
  UpdateSettingRequest,
  WalletStats,
} from '@/types';

/* ============================================================
   Zeroed defaults — typed empty shapes so admin pages render
   honest "no data yet" states instead of fabricated seed data.
   ============================================================ */

const emptyAnalytics = (): AdminAnalytics => ({
  revenue: { totalRevenue: 0, monthlyRevenue: 0, weeklyRevenue: 0, averageTransactionValue: 0, revenueByMonth: {} },
  growth: {
    userGrowthRate: 0,
    mentorGrowthRate: 0,
    sessionGrowthRate: 0,
    revenueGrowthRate: 0,
    registrationsByDay: {},
  },
  users: { totalUsers: 0, activeUsers: 0, newUsersToday: 0, newUsersThisWeek: 0, newUsersThisMonth: 0, usersByRole: {} },
  sessions: {
    totalSessions: 0,
    completedSessions: 0,
    cancelledSessions: 0,
    averageSessionDuration: 0,
    sessionsToday: 0,
    sessionsByStatus: {},
  },
  engagement: { averageRating: 0, totalReviews: 0, totalPosts: 0, totalComments: 0, mentorResponseRate: 0 },
});

const emptyRevenue = (): RevenueAnalytics => ({
  totalRevenue: 0,
  monthlyRevenue: 0,
  weeklyRevenue: 0,
  averageTransactionValue: 0,
  revenueByMonth: {},
});

const emptyWalletStats = (): WalletStats => ({
  totalCreditsIssued: 0,
  creditsOutstanding: 0,
  creditsUsed: 0,
  rewardsDistributed: 0,
  bonusesDistributed: 0,
  refundsProcessed: 0,
  averageBalance: 0,
});

/* ============================================================
   Defensive merging — the backend may return a partial payload
   (null sections) or fail entirely. Every admin page merges the
   response over the zeroed defaults so the UI always renders
   instantly and never crashes on `Object.entries(null)`.
   ============================================================ */

const mergeDashboard = (data: Partial<AdminDashboard> | undefined): AdminDashboard => ({
  ...seedDashboard,
  ...data,
  userStats: { ...seedDashboard.userStats, ...(data?.userStats ?? {}) },
  mentorStats: { ...seedDashboard.mentorStats, ...(data?.mentorStats ?? {}) },
  sessionStats: { ...seedDashboard.sessionStats, ...(data?.sessionStats ?? {}) },
  revenueStats: { ...seedDashboard.revenueStats, ...(data?.revenueStats ?? {}) },
  communityStats: { ...seedDashboard.communityStats, ...(data?.communityStats ?? {}) },
  reviewStats: { ...seedDashboard.reviewStats, ...(data?.reviewStats ?? {}) },
  recentActivities: data?.recentActivities ?? seedDashboard.recentActivities,
  systemHealth: { ...seedDashboard.systemHealth, ...(data?.systemHealth ?? {}) },
});

const mergeAnalytics = (data: Partial<AdminAnalytics> | undefined): AdminAnalytics => {
  const fallback = emptyAnalytics();
  return {
    ...fallback,
    ...data,
    revenue: { ...fallback.revenue, ...(data?.revenue ?? {}) },
    growth: { ...fallback.growth, ...(data?.growth ?? {}) },
    users: { ...fallback.users, ...(data?.users ?? {}) },
    sessions: { ...fallback.sessions, ...(data?.sessions ?? {}) },
    engagement: { ...fallback.engagement, ...(data?.engagement ?? {}) },
  };
};

/* ============================================================
   Executive dashboard & analytics
   ============================================================ */

export const useAdminDashboardQuery = () => {
  const result = useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: async () => {
      const response = await adminService.getDashboard();
      return response.data.data;
    },
    // No refetchInterval: the backend caches the dashboard for 5 minutes, so
    // polling every 60s only fires the global loading bar and hits a slow
    // endpoint for zero freshness benefit.
    staleTime: 60 * 1000,
    retry: 1,
  });
  const dashboard = mergeDashboard(result.data);
  return { ...result, dashboard, isOffline: result.isError };
};

export const useAdminAnalyticsQuery = () => {
  const result = useQuery({
    queryKey: adminKeys.analytics(),
    queryFn: async () => {
      const response = await adminService.getAnalytics();
      return response.data.data;
    },
    staleTime: 60 * 1000,
    retry: 1,
  });
  return { ...result, analytics: mergeAnalytics(result.data), isOffline: result.isError };
};

export const useRevenueAnalyticsQuery = () => {
  const result = useQuery({
    queryKey: [...adminKeys.all, 'revenue-analytics'] as const,
    queryFn: async () => {
      const response = await adminService.getPaymentsAnalytics();
      return response.data.data;
    },
    staleTime: 60 * 1000,
    retry: 1,
  });
  const fallback = useMemo(() => emptyRevenue(), []);
  return { ...result, revenue: result.data ?? fallback, isOffline: result.isError };
};

/* ============================================================
   Users
   ============================================================ */

export const useAdminUsersQuery = (page = 0, size = 20) => {
  const result = useQuery({
    queryKey: adminKeys.users(page, size),
    queryFn: async () => {
      const response = await adminService.getUsers(page, size);
      return response.data.data.content;
    },
    staleTime: 30 * 1000,
    retry: 1,
  });
  const users = result.data ?? ([] as AdminUser[]);
  const totalElements = result.data?.length ?? 0;
  return {
    ...result,
    users,
    totalElements,
    totalPages: Math.max(1, Math.ceil(totalElements / size)),
    isOffline: result.isError,
  };
};

/** Suspends / activates a user with optimistic cache updates. */
export const useAdminUserStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, active }: { userId: string; active: boolean }) =>
      adminService.updateUserStatus(userId, active).then(() => undefined),
    onMutate: ({ userId, active }) => {
      queryClient.setQueriesData<unknown>({ queryKey: adminKeys.all }, (oldData: unknown) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.map((item) => {
          const user = item as AdminUser;
          if (user.id !== userId) return user;
          return { ...user, status: active ? 'ACTIVE' : 'SUSPENDED' };
        });
      });
    },
    onSuccess: (_data, variables) =>
      showSuccess(variables.active ? 'User activated' : 'User suspended'),
    onError: (error) => showError(getErrorMessage(error)),
  });
};

/* ============================================================
   Mentors
   ============================================================ */

/**
 * Maps a real mentor row (from mentor-service) to the AdminMentor shape used
 * by the console. Metrics that mentor-service does not track per mentor
 * (revenue, hourly rate, response rate, certificates count) stay zeroed rather
 * than fabricated — the identity/expertise/rating/session columns are real.
 */
const toAdminMentor = (mentor: MentorSummary): AdminMentor => ({
  id: mentor.id,
  name: mentor.headline || 'Mentor',
  email: '',
  status:
    mentor.status === 'PENDING_VERIFICATION'
      ? 'PENDING'
      : mentor.status === 'SUSPENDED'
        ? 'SUSPENDED'
        : 'ACTIVE',
  verified: mentor.verified ?? false,
  rating: mentor.averageRating,
  reviewCount: mentor.totalReviews,
  sessionsCompleted: mentor.totalSessions,
  revenue: 0,
  hourlyRate: 0,
  expertise: [],
  responseRate: 0,
  joinedAt: mentor.createdAt ?? '',
  lastActiveAt: '',
  certificates: 0,
});

export const useAdminMentorsQuery = () => {
  const result = useQuery({
    queryKey: adminKeys.mentors(0, 50),
    queryFn: async () => {
      const response = await mentorService.searchMentors({ page: 0, size: 50 });
      return response.data.data.content.map(toAdminMentor);
    },
    staleTime: 30 * 1000,
    retry: 1,
  });
  return { ...result, mentors: (result.data ?? []) as AdminMentor[], isOffline: result.isError };
};

/**
 * Approval queue derived from the REAL mentor directory — mentors that are
 * still PENDING_VERIFICATION in mentor-service. The mentor summary response
 * carries the applicant's headline/bio/years/status, which we surface on the
 * approval cards (name/email are not stored in mentor-service).
 */
export const useMentorApprovalsQuery = () => {
  const result = useQuery({
    queryKey: adminKeys.mentorApprovals(),
    queryFn: async () => {
      const response = await mentorService.getPendingMentors(0, 200);
      return response.data.data.content.map(
        (mentor): MentorApproval => ({
          id: mentor.id,
          name: mentor.headline || 'Mentor Applicant',
          email: '',
          expertise: [],
          yearsExperience: mentor.yearsOfExperience ?? 0,
          requestedAt: mentor.createdAt ?? new Date().toISOString(),
          verificationScore: 0,
          certificates: [],
          bio: mentor.bio ?? '',
          hourlyRate: 0,
          status: 'PENDING',
        }),
      );
    },
    staleTime: 30 * 1000,
    retry: 1,
  });
  return {
    ...result,
    approvals: (result.data ?? []) as MentorApproval[],
    isOffline: result.isError,
  };
};

export const useApproveMentorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mentorId: string) => mentorService.verifyMentor(mentorId, true).then(() => undefined),
    onMutate: (mentorId) => {
      queryClient.setQueryData<MentorApproval[]>(adminKeys.mentorApprovals(), (old) =>
        old?.map((m) => (m.id === mentorId ? { ...m, status: 'APPROVED' as const } : m)) ?? old,
      );
    },
    onSuccess: () => showSuccess('Mentor approved ✅'),
    onError: (error) => showError(getErrorMessage(error)),
  });
};

export const useRejectMentorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mentorId, reason }: { mentorId: string; reason: string }) =>
      mentorService.verifyMentor(mentorId, false, reason).then(() => undefined),
    onMutate: ({ mentorId }) => {
      queryClient.setQueryData<MentorApproval[]>(adminKeys.mentorApprovals(), (old) =>
        old?.map((m) => (m.id === mentorId ? { ...m, status: 'REJECTED' as const } : m)) ?? old,
      );
    },
    onSuccess: () => showInfo('Mentor application rejected'),
    onError: (error) => showError(getErrorMessage(error)),
  });
};

/* ============================================================
   Sessions, payments, wallet
   ============================================================ */

export const useAdminSessionsQuery = () => {
  const result = useQuery({
    queryKey: adminKeys.sessions(),
    queryFn: async () => {
      const response = await adminService.getAnalytics();
      return response.data.data;
    },
    staleTime: 60 * 1000,
    retry: 1,
  });
  return {
    ...result,
    sessions: [] as AdminSession[],
    analytics: mergeAnalytics(result.data),
    isOffline: result.isError,
  };
};

export const useAdminPaymentsQuery = () => {
  const result = useQuery({
    queryKey: adminKeys.payments(),
    queryFn: async () => {
      const response = await adminService.getPaymentsAnalytics();
      return response.data.data;
    },
    staleTime: 60 * 1000,
    retry: 1,
  });
  return {
    ...result,
    payments: [] as AdminPayment[],
    refunds: [] as AdminRefund[],
    subscriptions: [] as AdminSubscription[],
    coupons: [] as AdminCoupon[],
    revenue: result.data,
    isOffline: result.isError,
  };
};

export const useRefundMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ refundId, action }: { refundId: string; action: 'APPROVE' | 'REJECT' }) =>
      adminService.manageRefund(refundId, action).then(() => undefined),
    onMutate: ({ refundId, action }) => {
      queryClient.setQueriesData<unknown>({ queryKey: adminKeys.refunds() }, (oldData: unknown) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.map((item) => {
          const refund = item as { id: string; status: string };
          if (refund.id !== refundId) return refund;
          return { ...refund, status: action === 'APPROVE' ? 'PROCESSED' : 'REJECTED' };
        });
      });
    },
    onSuccess: (_data, variables) =>
      showSuccess(variables.action === 'APPROVE' ? 'Refund approved' : 'Refund rejected'),
    onError: (error) => showError(getErrorMessage(error)),
  });
};

export const useAdminWalletQuery = () => {
  // The admin-service exposes no wallet ledger endpoint yet, so the wallet
  // management page shows an honest empty state until it ships.
  return {
    transactions: [] as AdminWalletTransaction[],
    stats: emptyWalletStats(),
    isOffline: false,
    isLoading: false,
  };
};

/* ============================================================
   Review moderation
   ============================================================ */

export const useAdminReviewsQuery = () => {
  const result = useQuery({
    queryKey: adminKeys.reviews(),
    queryFn: async () => {
      const response = await adminService.getAnalytics();
      return response.data.data.engagement;
    },
    staleTime: 60 * 1000,
    retry: 1,
  });
  return {
    ...result,
    reviews: [] as ModerationReview[],
    analytics: {
      totalReviews: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      reported: 0,
      averageRating: 0,
      helpfulVotes: 0,
      ratingsDistribution: {} as Record<string, number>,
    },
    isOffline: result.isError,
  };
};

/**
 * Approves / rejects a review (optimistic).
 * Note: the admin-service has no dedicated review-moderation endpoint yet, so
 * the action is applied locally and kept in sync when the moderation API ships.
 */
export const useReviewModerationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (_variables: { reviewId: string; status: 'APPROVED' | 'REJECTED' }) =>
      Promise.resolve(undefined as void),
    onMutate: ({ reviewId, status }) => {
      queryClient.setQueryData<ModerationReview[]>(
        [...adminKeys.all, 'moderation-reviews'] as const,
        (old) => old?.map((r) => (r.id === reviewId ? { ...r, status } : r)) ?? old,
      );
    },
    onSuccess: (_data, variables) =>
      showSuccess(variables.status === 'APPROVED' ? 'Review approved' : 'Review rejected'),
    onError: (error) => showError(getErrorMessage(error)),
  });
};

/* ============================================================
   Platform settings
   ============================================================ */

export const useAdminSettingsQuery = () => {
  const result = useQuery({
    queryKey: adminKeys.settings(),
    queryFn: async () => {
      const response = await adminService.getSettings();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  return { ...result, settings: (result.data ?? []) as PlatformSetting[], isOffline: result.isError };
};

export const useUpdateSettingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSettingRequest) =>
      adminService.updateSetting(payload).then((r) => r.data.data),
    onSuccess: (setting) => {
      queryClient.setQueryData<PlatformSetting[]>(adminKeys.settings(), (old) =>
        old?.map((s) => (s.settingKey === setting.settingKey ? { ...s, ...setting } : s)) ?? old,
      );
      showSuccess('Setting saved');
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};

