import { apiClient } from '@/api';
import { API_ENDPOINTS } from '@/constants';
import type { ApiResponse, Meeting, MeetingStatePayload, MeetingDeviceSelection } from '@/types';

const resolve = (template: string, params: Record<string, string>): string =>
  Object.entries(params).reduce((url, [key, value]) => url.replace(`{${key}}`, value), template);

/** Meeting REST endpoints (with simulated-driver fallback in the meeting UI). */
export const meetingService = {
  getMeeting: (meetingId: string) =>
    apiClient.get<ApiResponse<Meeting>>(resolve(API_ENDPOINTS.MEETING.ITEM, { meetingId })),

  getRecent: (page = 0, size = 12) =>
    apiClient.get<ApiResponse<Meeting[]>>(
      `${API_ENDPOINTS.MEETING.RECENT}?page=${page}&size=${size}`,
    ),

  getUpcomingMeetings: (page = 0, size = 12) =>
    apiClient.get<ApiResponse<Meeting[]>>(
      `${API_ENDPOINTS.MEETING.RECENT}?page=${page}&size=${size}&status=scheduled`, 
    ),

  getMeetingForSession: (sessionId: string) =>
    apiClient.get<ApiResponse<Meeting>>(
      resolve(API_ENDPOINTS.SESSIONS.MEETING, { sessionId }),
    ),

  saveDevicePreferences: (devices: MeetingDeviceSelection) =>
    apiClient.post<ApiResponse<void>>(`${API_ENDPOINTS.MEETING.BASE}/devices`, devices),

  createInstant: (title: string, kind = 'instant') =>
    apiClient.post<ApiResponse<Meeting>>(API_ENDPOINTS.MEETING.INSTANT, { title, kind }),

  join: (meetingId: string) =>
    apiClient.post<ApiResponse<Meeting>>(resolve(API_ENDPOINTS.MEETING.JOIN, { meetingId })),

  leave: (meetingId: string) =>
    apiClient.post<ApiResponse<void>>(resolve(API_ENDPOINTS.MEETING.LEAVE, { meetingId })),

  end: (meetingId: string) =>
    apiClient.post<ApiResponse<void>>(resolve(API_ENDPOINTS.MEETING.END, { meetingId })),

  updateState: (meetingId: string, payload: Omit<MeetingStatePayload, 'meetingId' | 'participantId'>) =>
    apiClient.post<ApiResponse<void>>(resolve(API_ENDPOINTS.MEETING.STATE, { meetingId }), payload),
} as const;

export default meetingService;
