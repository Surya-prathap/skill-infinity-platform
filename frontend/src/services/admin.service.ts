import { apiClient } from '@/api';
import { API_ENDPOINTS } from '@/constants';
import type {
  AdminDashboard,
  AdminUser,
  ApiResponse,
  PageResponse,
  PlatformSetting,
  UpdateSettingRequest,
} from '@/types';

const resolve = (template: string, params: Record<string, string>): string =>
  Object.entries(params).reduce((url, [key, value]) => url.replace(`{${key}}`, value), template);

/**
 * admin-service endpoints — dashboard, users, mentor verification and
 * platform settings (ADMIN role only).
 */
export const adminService = {
  /* ---------------- Executive dashboard ---------------- */
  getDashboard: () =>
    apiClient.get<ApiResponse<AdminDashboard>>(API_ENDPOINTS.ADMIN.DASHBOARD),

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

  /* ---------------- Platform settings ---------------- */
  getSettings: () =>
    apiClient.get<ApiResponse<PlatformSetting[]>>(API_ENDPOINTS.ADMIN.SETTINGS),

  updateSetting: (payload: UpdateSettingRequest) =>
    apiClient.put<ApiResponse<PlatformSetting>>(API_ENDPOINTS.ADMIN.SETTINGS, payload),
};

export default adminService;
