import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sessionService } from '@/services';
import { getErrorMessage, showError, showSuccess } from '@/utils';
import type {
  BookingRequest,
  BookingResponse,
  CancellationRequest,
  CalendarData,
  PageResponse,
  RescheduleRequest,
  Session,
} from '@/types';
import { sessionKeys } from './queryKeys';
import { seedCalendarEvents, seedSessions } from './data';

/** Upcoming sessions for the authenticated user (offline → seed). */
export const useUpcomingSessionsQuery = (page = 0, size = 20) => {
  const query = useQuery({
    queryKey: sessionKeys.upcoming(page, size),
    queryFn: async () => {
      const response = await sessionService.getUpcoming(page, size);
      return response.data.data;
    },
    placeholderData: (): PageResponse<Session> => {
      const content = seedSessions.filter((s) => !['COMPLETED', 'CANCELLED'].includes(s.status));
      return {
        content,
        page,
        size,
        totalElements: content.length,
        totalPages: 1,
        first: true,
        last: true,
        empty: content.length === 0,
      };
    },
    retry: 1,
  });

  const data = (query.data ?? {
    content: seedSessions.filter((s) => !['COMPLETED', 'CANCELLED'].includes(s.status)),
    page,
    size,
    totalElements: seedSessions.filter((s) => !['COMPLETED', 'CANCELLED'].includes(s.status)).length,
    totalPages: 1,
    first: true,
    last: true,
    empty: false,
  }) as PageResponse<Session>;

  return { ...query, data, isOffline: query.isError };
};

/** Session history (completed / cancelled / rescheduled). */
export const useSessionHistoryQuery = (page = 0, size = 20) => {
  const query = useQuery({
    queryKey: sessionKeys.history(page, size),
    queryFn: async () => {
      const response = await sessionService.getHistory(page, size);
      return response.data.data;
    },
    placeholderData: (): PageResponse<Session> => {
      const content = seedSessions.filter((s) => ['COMPLETED', 'CANCELLED'].includes(s.status));
      return {
        content,
        page,
        size,
        totalElements: content.length,
        totalPages: 1,
        first: true,
        last: true,
        empty: content.length === 0,
      };
    },
    retry: 1,
  });

  const data = (query.data ?? {
    content: seedSessions.filter((s) => ['COMPLETED', 'CANCELLED'].includes(s.status)),
    page,
    size,
    totalElements: seedSessions.filter((s) => ['COMPLETED', 'CANCELLED'].includes(s.status)).length,
    totalPages: 1,
    first: true,
    last: true,
    empty: false,
  }) as PageResponse<Session>;

  return { ...query, data, isOffline: query.isError };
};

/** Session detail by ID (offline → seed lookup). */
export const useSessionQuery = (sessionId?: string) => {
  const query = useQuery({
    queryKey: sessionKeys.detail(sessionId ?? 'none'),
    queryFn: async () => {
      const response = await sessionService.getSession(sessionId!);
      return response.data.data;
    },
    enabled: Boolean(sessionId),
    retry: 1,
  });

  const fallback = seedSessions.find((s) => s.id === sessionId) ?? null;
  const session = query.data ?? fallback;

  return { ...query, session, isOffline: query.isError && !query.data };
};

/** Calendar events in a date range (offline → seed). */
export const useCalendarQuery = (startDate?: string, endDate?: string) => {
  const query = useQuery({
    queryKey: sessionKeys.calendar(startDate, endDate),
    queryFn: async () => {
      const response = await sessionService.getCalendar(startDate, endDate);
      return response.data.data;
    },
    placeholderData: (): CalendarData => ({
      events: seedCalendarEvents.filter((event) => {
        if (!startDate) return true;
        return event.startTime >= startDate && (!endDate || event.startTime <= endDate);
      }),
    }),
    retry: 1,
  });

  const data = (query.data ?? { events: seedCalendarEvents }) as CalendarData;

  return { ...query, data, isOffline: query.isError };
};

/* ============================================================
   Mutations — booking, reschedule, cancel, lifecycle
   ============================================================ */

export const useBookSessionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BookingRequest): Promise<BookingResponse> =>
      sessionService.bookSession(payload).then((response) => response.data.data),
    onSuccess: () => {
      showSuccess('Booking submitted! The mentor will confirm shortly.');
      void queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};

export const useRescheduleSessionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RescheduleRequest): Promise<Session> =>
      sessionService.rescheduleSession(payload).then((response) => response.data.data),
    onSuccess: () => {
      showSuccess('Session rescheduled successfully.');
      void queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};

export const useCancelSessionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CancellationRequest): Promise<Session> =>
      sessionService.cancelSession(payload).then((response) => response.data.data),
    onSuccess: () => {
      showSuccess('Session cancelled.');
      void queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};

export const useCompleteSessionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string): Promise<Session> =>
      sessionService.completeSession(sessionId).then((response) => response.data.data),
    onSuccess: () => {
      showSuccess('Session marked as completed.');
      void queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};
