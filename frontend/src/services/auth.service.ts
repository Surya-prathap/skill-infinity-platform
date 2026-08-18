import type { AxiosRequestConfig } from 'axios';
import { apiClient } from '@/api';
import { API_ENDPOINTS } from '@/constants';
import type {
  ApiResponse,
  AuthResponse,
  AuthUser,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
} from '@/types';

export const authService = {
  login: (payload: LoginRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.LOGIN, payload),

  register: (payload: RegisterRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.REGISTER, payload),

  logout: (refreshToken: string) =>
    apiClient.post<ApiResponse<null>>(API_ENDPOINTS.AUTH.LOGOUT, { refreshToken }),

  getCurrentUser: (config?: AxiosRequestConfig) =>
    apiClient.get<ApiResponse<AuthUser>>(API_ENDPOINTS.AUTH.ME, config),

  changePassword: (payload: ChangePasswordRequest) =>
    apiClient.post<ApiResponse<null>>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, payload),

  forgotPassword: (email: string) =>
    apiClient.post<ApiResponse<null>>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, null, {
      params: { email },
    }),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post<ApiResponse<null>>(API_ENDPOINTS.AUTH.RESET_PASSWORD, null, {
      params: { token, newPassword },
    }),
};
