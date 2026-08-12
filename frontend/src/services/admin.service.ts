import { apiClient } from '@/api';
import { API_ENDPOINTS } from '@/constants';
import type {
  AdminAnalytics,
  AdminDashboard,
  AdminUser,
  ApiResponse,
  PageResponse,
  PlatformSetting,
  RevenueAnalytics,
  UpdateSettingRequest,
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

  /* ---------------- Platform settings ---------------- */
  getSettings: () =>
    apiClient.get<ApiResponse<PlatformSetting[]>>(API_ENDPOINTS.ADMIN.SETTINGS),

  updateSetting: (payload: UpdateSettingRequest) =>
    apiClient.put<ApiResponse<PlatformSetting>>(API_ENDPOINTS.ADMIN.SETTINGS, payload),
};

export default adminService;
