import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, mentorService } from '@/services';
import { getErrorMessage, showError, showInfo, showSuccess } from '@/utils';
import { adminKeys } from './queryKeys';
import { seedDashboard } from './data';
import type {
  AdminDashboard,
  AdminMentor,
  AdminUser,
  MentorApproval,
  MentorSummary,
  PlatformSetting,
  UpdateSettingRequest,
} from '@/types';

/* ============================================================
   Executive dashboard
   ============================================================ */

/** Merges the response over zeroed defaults so the UI never crashes on a partial payload. */
const mergeDashboard = (data: Partial<AdminDashboard> | undefined): AdminDashboard => ({
  ...seedDashboard,
  ...data,
  recentActivities: data?.recentActivities ?? seedDashboard.recentActivities,
  systemHealth: { ...seedDashboard.systemHealth, ...(data?.systemHealth ?? {}) },
});

export const useAdminDashboardQuery = () => {
  const result = useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: async () => {
      const response = await adminService.getDashboard();
      return response.data.data;
    },
    // No refetchInterval: the backend caches the dashboard for 5 minutes, so
    // polling only fires the global loading bar for zero freshness benefit.
    staleTime: 60 * 1000,
    retry: 1,
  });
  const dashboard = mergeDashboard(result.data);
  return { ...result, dashboard, isOffline: result.isError };
};

/* ============================================================
   Users
   ============================================================ */

/** Raw admin-service user row (AdminUserResponse). */
interface AdminUserRow {
  id: string;
  userId?: string;
  name?: string;
  email?: string;
  role?: string;
  active?: boolean;
  status?: string;
  lastLoginAt?: string;
  createdAt?: string;
}

/** Maps the admin-service row to the console's AdminUser shape. */
const toAdminUser = (row: AdminUserRow): AdminUser => ({
  id: row.userId ?? row.id,
  name: row.name || row.email || 'User',
  email: row.email ?? '',
  role: (row.role as AdminUser['role']) ?? 'ROLE_USER',
  status: row.status === 'ACTIVE' || row.status === 'SUSPENDED' || row.status === 'PENDING' || row.status === 'BANNED'
    ? row.status
    : row.active === false
      ? 'SUSPENDED'
      : 'ACTIVE',
  joinedAt: row.createdAt ?? '',
  lastActiveAt: row.lastLoginAt ?? '',
  // Aggregates (sessions/spend/wallet) are not tracked per-user yet — shown as 0.
  sessionsCompleted: 0,
  totalSpend: 0,
  walletBalance: 0,
});

export const useAdminUsersQuery = (page = 0, size = 20) => {
  const result = useQuery({
    queryKey: adminKeys.users(page, size),
    queryFn: async () => {
      const response = await adminService.getUsers(page, size);
      return (response.data.data.content ?? []).map(toAdminUser);
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
