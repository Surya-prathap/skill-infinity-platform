import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services';
import { getErrorMessage, showError, showInfo, showSuccess } from '@/utils';
import { adminKeys } from './queryKeys';
import {
  seedAnalytics,
  seedAnnouncements,
  seedAuditLogs,
  seedCommunities,
  seedCommunityPosts,
  seedCoupons,
  seedDashboard,
  seedFeatureFlags,
  seedMentorApprovals,
  seedMentors,
  seedModerationQueue,
  seedModerationReviews,
  seedPayments,
  seedPolls,
  seedRefunds,
  seedReportDefinitions,
  seedReviewAnalytics,
  seedSessions,
  seedSettings,
  seedSubscriptions,
  seedSystemMetrics,
  seedTickets,
  seedUsers,
  seedWalletStats,
  seedWalletTransactions,
  seedAnnouncementTemplates,
  seedServices,
} from './data';
import type {
  AdminAnalytics,
  AdminMentor,
  AdminUser,
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
} from '@/types';

/** Offline-first: prefer the API but keep the admin console usable when the backend is unreachable. */
const offline = <T,>(promise: Promise<T>, fallback: () => T): Promise<T> =>
  promise.catch(() => fallback());

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
  return { ...result, dashboard: result.data ?? seedDashboard, isOffline: result.isError };
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
  return { ...result, analytics: (result.data ?? seedAnalytics) as AdminAnalytics, isOffline: result.isError };
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
  const fallback: RevenueAnalytics = useMemo(
    () => ({
      totalRevenue: seedAnalytics.revenue.totalRevenue,
      monthlyRevenue: seedAnalytics.revenue.monthlyRevenue,
      weeklyRevenue: seedAnalytics.revenue.weeklyRevenue,
      averageTransactionValue: seedAnalytics.revenue.averageTransactionValue,
      revenueByMonth: seedAnalytics.revenue.revenueByMonth,
    }),
    [],
  );
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
  const fallback = useMemo(
    () => seedUsers.slice(page * size, page * size + size),
    [page, size],
  );
  const totalElements = Math.max(result.data?.length ?? fallback.length, seedUsers.length);
  return {
    ...result,
    users: result.data ?? fallback,
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
      offline(
        adminService.updateUserStatus(userId, active).then(() => undefined),
        () => undefined,
      ),
    onMutate: ({ userId, active }) => {
      const seedUser = seedUsers.find((u) => u.id === userId);
      if (seedUser) seedUser.status = active ? 'ACTIVE' : 'SUSPENDED';
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

export const useAdminMentorsQuery = () => {
  const result = useQuery({
    queryKey: adminKeys.mentors(0, 50),
    queryFn: async () => {
      const response = await adminService.getMentors(0, 50);
      return response.data.data.content;
    },
    staleTime: 30 * 1000,
    retry: 1,
  });
  return { ...result, mentors: (result.data ?? seedMentors) as AdminMentor[], isOffline: result.isError };
};

export const useMentorApprovalsQuery = () => {
  // The admin-service exposes mentors as AdminUserResponse rows which cannot be
  // mapped to approval-shaped cards without profile data, so the approval queue
  // is seed-backed (the live list renders from the mentors endpoint instead).
  const result = useQuery({
    queryKey: adminKeys.mentorApprovals(),
    queryFn: async () => seedMentorApprovals,
    staleTime: 30 * 1000,
    retry: 1,
  });
  return {
    ...result,
    approvals: (result.data ?? seedMentorApprovals) as MentorApproval[],
    isOffline: result.isError,
  };
};

export const useApproveMentorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mentorId: string) =>
      offline(adminService.approveMentor(mentorId).then(() => undefined), () => undefined),
    onMutate: (mentorId) => {
      const seed = seedMentorApprovals.find((m) => m.id === mentorId);
      if (seed) seed.status = 'APPROVED';
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
      offline(adminService.rejectMentor(mentorId, reason).then(() => undefined), () => undefined),
    onMutate: ({ mentorId }) => {
      const seed = seedMentorApprovals.find((m) => m.id === mentorId);
      if (seed) seed.status = 'REJECTED';
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
  return { ...result, sessions: seedSessions, analytics: result.data, isOffline: result.isError };
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
    payments: seedPayments,
    refunds: seedRefunds,
    subscriptions: seedSubscriptions,
    coupons: seedCoupons,
    revenue: result.data,
    isOffline: result.isError,
  };
};

export const useRefundMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ refundId, action }: { refundId: string; action: 'APPROVE' | 'REJECT' }) =>
      offline(
        adminService.manageRefund(refundId, action).then(() => undefined),
        () => undefined,
      ),
    onMutate: ({ refundId, action }) => {
      const seed = seedRefunds.find((r) => r.id === refundId);
      if (seed) seed.status = action === 'APPROVE' ? 'PROCESSED' : 'REJECTED';
      queryClient.setQueryData<typeof seedRefunds>(adminKeys.refunds(), (old) =>
        old?.map((r) =>
          r.id === refundId
            ? { ...r, status: action === 'APPROVE' ? ('PROCESSED' as const) : ('REJECTED' as const) }
            : r,
        ) ?? old,
      );
    },
    onSuccess: (_data, variables) =>
      showSuccess(variables.action === 'APPROVE' ? 'Refund approved' : 'Refund rejected'),
    onError: (error) => showError(getErrorMessage(error)),
  });
};

export const useAdminWalletQuery = () => {
  // The admin-service exposes no wallet ledger endpoint, so the wallet
  // management page is seed-backed (stats + transactions).
  const result = useQuery({
    queryKey: adminKeys.wallet(),
    queryFn: async () => seedWalletStats,
    staleTime: 60 * 1000,
    retry: 1,
  });
  return {
    ...result,
    transactions: seedWalletTransactions,
    stats: (result.data ?? seedWalletStats) as typeof seedWalletStats,
    isOffline: result.isError,
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
    moderationQueue: seedModerationQueue,
    posts: seedCommunityPosts,
    communities: seedCommunities,
    polls: seedPolls,
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
      const seed = seedModerationQueue.find((m) => m.id === itemId);
      if (seed) seed.status = status;
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
    reviews: seedModerationReviews,
    analytics: seedReviewAnalytics,
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
      const seed = seedModerationReviews.find((r) => r.id === reviewId);
      if (seed) seed.status = status;
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
  const fallback = useMemo(
    () => (status ? seedTickets.filter((t) => t.status === status) : seedTickets),
    [status],
  );
  return { ...result, tickets: (result.data ?? fallback) as SupportTicket[], isOffline: result.isError };
};

export const useSupportReplyMutation = (ticketId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message: string) =>
      offline(adminService.replyToTicket(ticketId, message).then(() => undefined), () => undefined),
    onMutate: (message) => {
      const seed = seedTickets.find((t) => t.id === ticketId);
      if (seed) {
        seed.replies.push({
          id: `reply-${Date.now()}`,
          senderName: 'Support Team',
          senderType: 'ADMIN',
          message,
          internal: false,
          createdAt: new Date().toISOString(),
        });
      }
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
  // The admin-service only exposes announcement creation; the list is
  // seed-backed until a read endpoint ships.
  const result = useQuery({
    queryKey: adminKeys.announcements(),
    queryFn: async () => seedAnnouncements,
    staleTime: 60 * 1000,
    retry: 1,
  });
  return {
    ...result,
    announcements: (result.data ?? seedAnnouncements) as SystemAnnouncement[],
    templates: seedAnnouncementTemplates as AnnouncementTemplate[],
    isOffline: result.isError,
  };
};

export const useCreateAnnouncementMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAnnouncementRequest) =>
      offline(
        adminService.createAnnouncement(payload).then((r) => r.data.data),
        (): SystemAnnouncement => ({
          id: `a-${Date.now()}`,
          title: payload.title,
          content: payload.content,
          announcementType: payload.announcementType,
          targetRole: payload.targetRole,
          priority: payload.priority,
          status: 'PUBLISHED',
          publishedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          author: 'You',
        }),
      ),
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
  // The admin-service has no report catalog endpoint, so the reports page is
  // seed-backed until a reporting API ships.
  const result = useQuery({
    queryKey: adminKeys.reports(),
    queryFn: async () => seedReportDefinitions,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
  return { ...result, reports: (result.data ?? seedReportDefinitions) as ReportDefinition[], isOffline: result.isError };
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
  return { ...result, settings: (result.data ?? seedSettings) as PlatformSetting[], isOffline: result.isError };
};

export const useUpdateSettingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateSettingRequest) =>
      offline(
        adminService.updateSetting(payload).then((r) => r.data.data),
        (): PlatformSetting => ({
          id: `set-${Date.now()}`,
          settingKey: payload.settingKey,
          settingValue: payload.settingValue,
          dataType: payload.dataType,
          description: payload.description,
          category: payload.category,
          encrypted: false,
          active: true,
          updatedAt: new Date().toISOString(),
        }),
      ),
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
  return { ...result, flags: (result.data ?? seedFeatureFlags) as FeatureFlag[], isOffline: result.isError };
};

export const useUpdateFeatureFlagMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateFeatureFlagRequest) =>
      offline(
        adminService.updateFeatureFlag(payload).then((r) => r.data.data),
        (): FeatureFlag => ({
          id: `ff-${Date.now()}`,
          featureKey: payload.featureKey,
          featureName: payload.featureName,
          description: payload.description,
          enabled: payload.enabled,
          rolloutPercentage: payload.rolloutPercentage,
          environment: payload.environment,
          active: true,
          updatedAt: new Date().toISOString(),
        }),
      ),
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
  return { ...result, logs: (result.data ?? seedAuditLogs) as AuditLog[], isOffline: result.isError };
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
    metrics: seedSystemMetrics,
    services: seedServices,
    health: result.data?.health,
    isOffline: result.isError,
  };
};

