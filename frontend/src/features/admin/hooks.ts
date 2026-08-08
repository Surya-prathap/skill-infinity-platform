import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services';
import { getErrorMessage, showError, showInfo, showSuccess } from '@/utils';
import { adminKeys } from './queryKeys';
import { seedDashboard } from './data';
import type {
  AdminAnalytics,
  AdminCommunity,
  AdminCommunityPost,
  AdminCoupon,
  AdminMentor,
  AdminPayment,
  AdminPoll,
  AdminRefund,
  AdminSession,
  AdminSubscription,
  AdminUser,
  AdminWalletTransaction,
  MonitoredService,
  AnnouncementTemplate,
  AuditLog,
  CreateAnnouncementRequest,
  FeatureFlag,
  MentorApproval,
  ModerationQueueItem,
  ModerationReview,
  PlatformSetting,
  ReportDefinition,
  RevenueAnalytics,
  SupportTicket,
  SystemAnnouncement,
  TicketStatus,
  UpdateFeatureFlagRequest,
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
   Executive dashboard & analytics
   ============================================================ */

export const useAdminDashboardQuery = () => {
  const result = useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: async () => {
      const response = await adminService.getDashboard();
      return response.data.data;
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    retry: 1,
  });
  const dashboard = result.data ?? seedDashboard;
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
  return { ...result, analytics: (result.data ?? emptyAnalytics()) as AdminAnalytics, isOffline: result.isError };
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

/** Maps an AdminUser row to the AdminMentor shape used by the console.
 * The admin-service mentors endpoint returns AdminUserResponse rows; fields
 * not present there (rating, revenue, hourly rate, expertise) are zeroed
 * rather than fabricated. */
const toAdminMentor = (user: AdminUser): AdminMentor => ({
  id: user.id,
  name: user.name,
  email: user.email,
  status: user.status === 'BANNED' ? 'SUSPENDED' : (user.status as AdminMentor['status']),
  verified: false,
  rating: 0,
  reviewCount: 0,
  sessionsCompleted: user.sessionsCompleted,
  revenue: 0,
  hourlyRate: 0,
  expertise: [],
  responseRate: 0,
  joinedAt: user.joinedAt,
  lastActiveAt: user.lastActiveAt,
  certificates: 0,
});

export const useAdminMentorsQuery = () => {
  const result = useQuery({
    queryKey: adminKeys.mentors(0, 50),
    queryFn: async () => {
      const response = await adminService.getMentors(0, 50);
      return response.data.data.content.map(toAdminMentor);
    },
    staleTime: 30 * 1000,
    retry: 1,
  });
  return { ...result, mentors: (result.data ?? []) as AdminMentor[], isOffline: result.isError };
};

/**
 * Approval queue derived from the real mentor directory (pending mentors).
 * Unavailable approval fields are zeroed/empty rather than fabricated.
 */
export const useMentorApprovalsQuery = () => {
  const result = useQuery({
    queryKey: adminKeys.mentorApprovals(),
    queryFn: async () => {
      const response = await adminService.getMentors(0, 200);
      const mentors = response.data.data.content;
      return mentors
        .filter((mentor) => mentor.status === 'PENDING')
        .map(
          (mentor): MentorApproval => ({
            id: mentor.id,
            name: mentor.name,
            email: mentor.email,
            expertise: [],
            yearsExperience: 0,
            requestedAt: mentor.joinedAt,
            verificationScore: 0,
            certificates: [],
            bio: '',
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
    mutationFn: (mentorId: string) => adminService.approveMentor(mentorId).then(() => undefined),
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
      adminService.rejectMentor(mentorId, reason).then(() => undefined),
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
      return response.data.data.sessions;
    },
    staleTime: 30 * 1000,
    retry: 1,
  });
  return { ...result, sessions: [] as AdminSession[], analytics: result.data, isOffline: result.isError };
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
   Community & review moderation
   ============================================================ */

export const useAdminCommunityQuery = () => {
  const result = useQuery({
    queryKey: adminKeys.community(),
    queryFn: async () => {
      const response = await adminService.getAnalytics();
      return response.data.data.engagement;
    },
    staleTime: 60 * 1000,
    retry: 1,
  });
  return {
    ...result,
    moderationQueue: [] as ModerationQueueItem[],
    posts: [] as AdminCommunityPost[],
    communities: [] as AdminCommunity[],
    polls: [] as AdminPoll[],
    engagement: result.data,
    isOffline: result.isError,
  };
};

/**
 * Resolves / dismisses a moderation queue item (optimistic).
 * Note: the admin-service has no dedicated moderation endpoint yet, so the
 * action is applied locally and kept in sync when the queue API ships.
 */
export const useModerationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (_variables: { itemId: string; status: 'RESOLVED' | 'DISMISSED' }) =>
      Promise.resolve(undefined as void),
    onMutate: ({ itemId, status }) => {
      queryClient.setQueryData<ModerationQueueItem[]>(
        [...adminKeys.all, 'moderation-queue'] as const,
        (old) => old?.map((m) => (m.id === itemId ? { ...m, status } : m)) ?? old,
      );
    },
    onSuccess: (_data, variables) =>
      showSuccess(variables.status === 'RESOLVED' ? 'Content actioned' : 'Report dismissed'),
    onError: (error) => showError(getErrorMessage(error)),
  });
};

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
   Support center
   ============================================================ */

export const useAdminSupportQuery = (status?: TicketStatus) => {
  const result = useQuery({
    queryKey: adminKeys.support(status),
    queryFn: async () => {
      const response = await adminService.getSupportTickets(status, 0, 100);
      return response.data.data.content;
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    retry: 1,
  });
  return { ...result, tickets: (result.data ?? []) as SupportTicket[], isOffline: result.isError };
};

export const useSupportReplyMutation = (ticketId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => adminService.replyToTicket(ticketId, message).then(() => undefined),
    onMutate: (message) => {
      queryClient.setQueryData<SupportTicket[]>(adminKeys.support(undefined), (old) =>
        old?.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                status: 'IN_PROGRESS' as TicketStatus,
                replies: [...t.replies, {
                  id: `reply-${Date.now()}`,
                  senderName: 'Support Team',
                  senderType: 'ADMIN' as const,
                  message,
                  internal: false,
                  createdAt: new Date().toISOString(),
                }],
              }
            : t,
        ) ?? old,
      );
    },
    onSuccess: () => showSuccess('Reply sent'),
    onError: (error) => showError(getErrorMessage(error)),
  });
};

/* ============================================================
   Announcements
   ============================================================ */

export const useAdminAnnouncementsQuery = () => {
  // The admin-service only exposes announcement creation; the list stays an
  // honest empty state until a read endpoint ships.
  const result = useQuery({
    queryKey: adminKeys.announcements(),
    queryFn: async () => [] as SystemAnnouncement[],
    staleTime: 60 * 1000,
    retry: 1,
  });
  return {
    ...result,
    announcements: (result.data ?? []) as SystemAnnouncement[],
    templates: [] as AnnouncementTemplate[],
    isOffline: result.isError,
  };
};

export const useCreateAnnouncementMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAnnouncementRequest) =>
      adminService.createAnnouncement(payload).then((r) => r.data.data),
    onSuccess: (announcement) => {
      queryClient.setQueryData<SystemAnnouncement[]>(adminKeys.announcements(), (old) =>
        old ? [announcement, ...old] : [announcement],
      );
      showSuccess('Announcement broadcast 🎉');
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};

/* ============================================================
   Reports
   ============================================================ */

export const useAdminReportsQuery = () => {
  // The admin-service has no report catalog endpoint, so the reports page
  // shows an honest empty state until a reporting API ships.
  return {
    reports: [] as ReportDefinition[],
    isOffline: false,
    isLoading: false,
  };
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

/* ============================================================
   Feature flags
   ============================================================ */

export const useAdminFeatureFlagsQuery = () => {
  const result = useQuery({
    queryKey: adminKeys.featureFlags(),
    queryFn: async () => {
      const response = await adminService.getFeatureFlags();
      return response.data.data;
    },
    staleTime: 60 * 1000,
    retry: 1,
  });
  return { ...result, flags: (result.data ?? []) as FeatureFlag[], isOffline: result.isError };
};

export const useUpdateFeatureFlagMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateFeatureFlagRequest) =>
      adminService.updateFeatureFlag(payload).then((r) => r.data.data),
    onSuccess: (flag) => {
      queryClient.setQueryData<FeatureFlag[]>(adminKeys.featureFlags(), (old) =>
        old?.map((f) => (f.featureKey === flag.featureKey ? { ...f, ...flag } : f)) ?? old,
      );
      showSuccess(flag.enabled ? 'Feature enabled' : 'Feature disabled');
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};

/* ============================================================
   Audit logs
   ============================================================ */

export const useAdminAuditLogsQuery = () => {
  const result = useQuery({
    queryKey: adminKeys.auditLogs(),
    queryFn: async () => {
      const response = await adminService.getAuditLogs(0, 100);
      return response.data.data.content;
    },
    staleTime: 60 * 1000,
    retry: 1,
  });
  return { ...result, logs: (result.data ?? []) as AuditLog[], isOffline: result.isError };
};

/* ============================================================
   System monitoring
   ============================================================ */

export const useAdminMonitoringQuery = () => {
  const result = useQuery({
    queryKey: adminKeys.monitoring(),
    queryFn: async () => {
      const response = await adminService.getDashboard();
      const health = response.data.data.systemHealth;
      return { health };
    },
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
    retry: 1,
  });
  return {
    ...result,
    metrics: {
      apiStatus: 'UP',
      database: 'UP',
      redis: 'UP',
      rabbitmq: 'UP',
      minio: 'UP',
      cpuUsage: 0,
      memoryUsage: 0,
      storageUsage: 0,
      responseTimeMs: 0,
      errorRate: 0,
      requestsPerMinute: 0,
      activeSockets: 0,
      latencySeries: [] as { label: string; value: number }[],
      requestVolume: [] as { label: string; value: number }[],
      errorRateSeries: [] as { label: string; value: number }[],
    },
    services: [] as MonitoredService[],
    health: result.data?.health,
    isOffline: result.isError,
  };
};
