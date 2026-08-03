import { apiClient } from '@/api';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse, UserProfile } from '@/types';

export const userService = {
  getProfile: () => apiClient.get<ApiResponse<UserProfile>>(API_ENDPOINTS.USERS.PROFILE),

  updateProfile: (payload: Partial<UserProfile>) =>
    apiClient.put<ApiResponse<UserProfile>>(API_ENDPOINTS.USERS.PROFILE, payload),
};
