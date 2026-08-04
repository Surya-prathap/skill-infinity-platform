import { apiClient } from '@/api';
import { API_ENDPOINTS } from '@/constants';
import type {
  ApiResponse,
  BookingRequest,
  BookingResponse,
  CalendarData,
  CancellationRequest,
  MeetingInfo,
  PageResponse,
  RescheduleRequest,
  Session,
  SessionFilters,
} from '@/types';

const resolve = (template: string, params: Record<string, string>): string =>
  Object.entries(params).reduce((url, [key, value]) => url.replace(`{${key}}`, value), template);

/**
 * session-service endpoints. Learner/mentor identity is resolved by the API
 * gateway from the JWT (X-User-ID header).
 */
export const sessionService = {
  /* ---------------- Booking ---------------- */

  bookSession: (payload: BookingRequest) =>
    apiClient.post<ApiResponse<BookingResponse>>(API_ENDPOINTS.SESSIONS.BOOK, payload),

  approveBooking: (bookingId: string) =>
    apiClient.post<ApiResponse<BookingResponse>>(
      `${API_ENDPOINTS.SESSIONS.APPROVE}?bookingId=${bookingId}`,
    ),

  rejectBooking: (bookingId: string, reason?: string) =>
    apiClient.post<ApiResponse<BookingResponse>>(
      `${API_ENDPOINTS.SESSIONS.REJECT}?bookingId=${bookingId}${reason ? `&reason=${encodeURIComponent(reason)}` : ''}`,
    ),

  /* ---------------- Queries ---------------- */

  getUpcoming: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<PageResponse<Session>>>(
      `${API_ENDPOINTS.SESSIONS.UPCOMING}?page=${page}&size=${size}`,
    ),

  getHistory: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<PageResponse<Session>>>(
      `${API_ENDPOINTS.SESSIONS.HISTORY}?page=${page}&size=${size}`,
    ),

  getSession: (sessionId: string) =>
    apiClient.get<ApiResponse<Session>>(
      resolve(API_ENDPOINTS.SESSIONS.ITEM, { sessionId }),
    ),

  searchSessions: (filters: SessionFilters, page = 0, size = 20) =>
    apiClient.get<ApiResponse<PageResponse<Session>>>(API_ENDPOINTS.SESSIONS.SEARCH, {
      params: { ...filters, page, size },
    }),

  /* ---------------- Calendar ---------------- */

  getCalendar: (startDate?: string, endDate?: string) =>
    apiClient.get<ApiResponse<CalendarData>>(API_ENDPOINTS.SESSIONS.CALENDAR, {
      params: { startDate, endDate },
    }),

  exportCalendarIcs: () => apiClient.get<string>(API_ENDPOINTS.SESSIONS.CALENDAR_EXPORT),

  /* ---------------- Lifecycle ---------------- */

  rescheduleSession: (payload: RescheduleRequest) =>
    apiClient.post<ApiResponse<Session>>(API_ENDPOINTS.SESSIONS.RESCHEDULE, payload),

  cancelSession: (payload: CancellationRequest) =>
    apiClient.post<ApiResponse<Session>>(API_ENDPOINTS.SESSIONS.CANCEL, payload),

  startSession: (sessionId: string) =>
    apiClient.post<ApiResponse<Session>>(
      `${API_ENDPOINTS.SESSIONS.START}?sessionId=${sessionId}`,
    ),

  endSession: (sessionId: string) =>
    apiClient.post<ApiResponse<Session>>(
      `${API_ENDPOINTS.SESSIONS.END}?sessionId=${sessionId}`,
    ),

  completeSession: (sessionId: string) =>
    apiClient.post<ApiResponse<Session>>(
      `${API_ENDPOINTS.SESSIONS.COMPLETE}?sessionId=${sessionId}`,
    ),

  /* ---------------- Meeting ---------------- */

  getMeetingLink: (sessionId: string) =>
    apiClient.get<ApiResponse<MeetingInfo>>(
      resolve(API_ENDPOINTS.SESSIONS.MEETING, { sessionId }),
    ),
};

export default sessionService;
