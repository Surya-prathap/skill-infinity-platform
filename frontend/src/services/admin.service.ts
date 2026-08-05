import { apiClient } from '@/api';
import { API_ENDPOINTS } from '@/constants';
import type {
  AdminAnalytics,
  AdminDashboard,
  AdminUser,
  ApiResponse,
  CreateAnnouncementRequest,
  FeatureFlag,
  PageResponse,
  PlatformSetting,
  RevenueAnalytics,
  SupportTicket,
  SystemAnnouncement,
  UpdateFeatureFlagRequest,
  UpdateSettingRequest,
  AuditLog,
} from '@/types';

const resolve = (template: string, params: Record<string, string>): string =>
  Object.entries(params).reduce((url, [key, value]) => url.replace(`{${key}}`, value), template);

/**
 * admin-service endpoints — platform administration, moderation, analytics,
 * announcements, support, settings and feature flags (ADMIN role only).
 */
export const adminService = {
  /* ---------------- Executive dashboard ---------------- */
  getDashboard: () =>
    apiClient.get<ApiResponse<AdminDashboard>>(API_ENDPOINTS.ADMIN.DASHBOARD),

  /* ---------------- Analytics ---------------- */
  getAnalytics: () =>
    apiClient.get<ApiResponse<AdminAnalytics>>(API_ENDPOINTS.ADMIN.ANALYTICS),

  getPaymentsAnalytics: () =>
    apiClient.get<ApiResponse<RevenueAnalytics>>(API_ENDPOINTS.ADMIN.PAYMENTS),

  /* ---------------- Users ---------------- */
  getUsers: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<PageResponse<AdminUser>>>(API_ENDPOINTS.ADMIN.USERS, {
      params: { page, size },
    }),

  updateUserStatus: (userId: string, active: boolean) =>
    apiClient.put<ApiResponse<void>>(
      resolve(API_ENDPOINTS.ADMIN.USER_STATUS, { userId }),
      undefined,
      { params: { active } },
    ),

  /* ---------------- Mentors ---------------- */
  getMentors: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<PageResponse<AdminUser>>>(API_ENDPOINTS.ADMIN.MENTORS, {
      params: { page, size },
    }),

  approveMentor: (mentorId: string) =>
    apiClient.put<ApiResponse<void>>(
      resolve(API_ENDPOINTS.ADMIN.MENTOR_APPROVE, { mentorId }),
    ),

  rejectMentor: (mentorId: string, reason: string) =>
    apiClient.put<ApiResponse<void>>(
      resolve(API_ENDPOINTS.ADMIN.MENTOR_REJECT, { mentorId }),
      undefined,
      { params: { reason } },
    ),

  /* ---------------- Payments ---------------- */
  manageRefund: (refundId: string, action: 'APPROVE' | 'REJECT') =>
    apiClient.put<ApiResponse<void>>(
      resolve(API_ENDPOINTS.ADMIN.REFUND, { refundId }),
      undefined,
      { params: { action } },
    ),

  /* ---------------- Announcements ---------------- */
  createAnnouncement: (payload: CreateAnnouncementRequest) =>
    apiClient.post<ApiResponse<SystemAnnouncement>>(
      API_ENDPOINTS.ADMIN.ANNOUNCEMENTS,
      payload,
    ),

  /* ---------------- Support center ---------------- */
  getSupportTickets: (status?: string, page = 0, size = 20) =>
    apiClient.get<ApiResponse<PageResponse<SupportTicket>>>(API_ENDPOINTS.ADMIN.SUPPORT, {
      params: { status, page, size },
    }),

  replyToTicket: (ticketId: string, message: string) =>
    apiClient.post<ApiResponse<SupportTicket>>(
      API_ENDPOINTS.ADMIN.SUPPORT_REPLY,
      undefined,
      { params: { ticketId, message } },
    ),

  /* ---------------- Audit logs ---------------- */
  getAuditLogs: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<PageResponse<AuditLog>>>(API_ENDPOINTS.ADMIN.AUDIT, {
      params: { page, size },
    }),

  /* ---------------- Platform settings ---------------- */
  getSettings: () =>
    apiClient.get<ApiResponse<PlatformSetting[]>>(API_ENDPOINTS.ADMIN.SETTINGS),

  updateSetting: (payload: UpdateSettingRequest) =>
    apiClient.put<ApiResponse<PlatformSetting>>(API_ENDPOINTS.ADMIN.SETTINGS, payload),

  /* ---------------- Feature flags ---------------- */
  getFeatureFlags: () =>
    apiClient.get<ApiResponse<FeatureFlag[]>>(API_ENDPOINTS.ADMIN.FEATURE_FLAGS),

  updateFeatureFlag: (payload: UpdateFeatureFlagRequest) =>
    apiClient.put<ApiResponse<FeatureFlag>>(API_ENDPOINTS.ADMIN.FEATURE_FLAGS, payload),
};

export default adminService;
