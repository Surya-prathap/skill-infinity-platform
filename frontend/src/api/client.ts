import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

/**
 * Requests flagged `silent: true` skip the global loading bar — used for
 * background polls (role sync) that must not flash the UI.
 */
declare module 'axios' {
  export interface AxiosRequestConfig {
    silent?: boolean;
  }
  export interface InternalAxiosRequestConfig {
    silent?: boolean;
  }
}
import { APP_CONFIG } from '@/config';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse, AuthResponse } from '@/types';
import { tokenManager } from './tokenManager';
import { requestStarted, requestFinished } from './loadingBridge';
import { onSessionExpired } from './sessionExpiryBridge';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  /** Marks a request already retried after a transient network-level failure. */
  _networkRetry?: boolean;
  /** When true, the global loading bar is not triggered for this request. */
  silent?: boolean;
}

const API_BASE_URL = APP_CONFIG.apiBaseUrl;

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: APP_CONFIG.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ---------------- Request interceptor: attach JWT + track global loading ---------------- */
apiClient.interceptors.request.use((config) => {
  const token = tokenManager.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (!(config as RetryableRequestConfig).silent) {
    requestStarted();
  }
  return config;
});

/* ---------------- Refresh-token single-flight queue ---------------- */
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (accessToken: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, accessToken: string | null): void => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else if (accessToken) resolve(accessToken);
    else reject(new Error('Token refresh failed'));
  });
  pendingQueue = [];
};

/**
 * Calls the identity-service refresh endpoint using a raw axios instance so
 * the interceptor chain is never re-entered.
 */
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = tokenManager.getRefreshToken();
  if (!refreshToken) return null;
  try {
    const response = await axios.post<ApiResponse<AuthResponse>>(
      `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
      { refreshToken },
      { timeout: APP_CONFIG.apiTimeout },
    );
    const data = response.data?.data;
    if (!data?.accessToken) return null;
    tokenManager.setTokens(data.accessToken, data.refreshToken ?? refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
};

let redirecting = false;

/** Clears the session and redirects to the login page (at most once). */
const handleSessionExpired = async (): Promise<void> => {
  tokenManager.clearTokens();
  onSessionExpired();
  if (redirecting) return;
  if (window.location.pathname.startsWith('/login')) return;
  redirecting = true;
  window.location.href = '/login?expired=true';
};

/* ---------------- Response interceptor: refresh + retry ---------------- */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (!(response.config as RetryableRequestConfig).silent) {
      requestFinished();
    }
    return response;
  },
  async (error: AxiosError) => {
    const failed = error.config as RetryableRequestConfig | undefined;
    if (!failed?.silent) {
      requestFinished();
    }
    const original = failed;
    const status = error.response?.status;

    // Transient network-level failure (connection reset while the backend is
    // GC-stalled, proxy hiccup, etc.): the request never received an HTTP
    // response, so it is safe to retry once. Timeouts (ECONNABORTED) and
    // explicit cancellations are excluded — they should surface immediately.
    // If the first attempt actually succeeded server-side but the response was
    // lost, a retried register/login simply returns the duplicate-account
    // message, which the auth forms already handle gracefully.
    if (!error.response && error.code !== 'ECONNABORTED' && error.code !== 'ERR_CANCELED') {
      if (!original?._networkRetry) {
        original!._networkRetry = true;
        await new Promise((resolve) => window.setTimeout(resolve, 600));
        return apiClient(original!);
      }
    }

    if (status !== 401 || !original) {
      return Promise.reject(error);
    }

    const isAuthEndpoint = original.url?.includes('/auth/');

    // Never try to refresh for auth endpoints themselves (e.g. bad credentials).
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (original._retry) {
      // A retried request failed again — the session is genuinely expired.
      await handleSessionExpired();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Another request is already refreshing — queue this one.
      original._retry = true;
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          original.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(original);
        })
        .catch(async (queueError) => {
          await handleSessionExpired();
          return Promise.reject(queueError);
        });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();
      if (newToken) {
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      }
      processQueue(new Error('Refresh token expired'), null);
      await handleSessionExpired();
      return Promise.reject(error);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await handleSessionExpired();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
