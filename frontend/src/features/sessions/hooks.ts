import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sessionService } from '@/services';
import { getErrorMessage, showError, showSuccess } from '@/utils';
import type {
  BookingRequest,
  BookingResponse,
  CancellationRequest,
  CalendarData,
  CommunityAllowance,
  CommunityImpact,
  CommunitySessionRequest,
  PageResponse,
  RescheduleRequest,
  Session,
} from '@/types';
import { sessionKeys } from './queryKeys';

const emptyPage = (page: number, size: number): PageResponse<Session> => ({
  content: [],
  page,
  size,
  totalElements: 0,
  totalPages: 1,
  first: page === 0,
  last: true,
  empty: true,
});

/** Upcoming sessions for the authenticated user. */
export const useUpcomingSessionsQuery = (page = 0, size = 20) => {
  const query = useQuery({
    queryKey: sessionKeys.upcoming(page, size),
    queryFn: async () => {
      const response = await sessionService.getUpcoming(page, size);
      return response.data.data;
    },
    retry: 1,
  });

  const data = query.data ?? emptyPage(page, size);

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
    retry: 1,
  });

  const data = query.data ?? emptyPage(page, size);

  return { ...query, data, isOffline: query.isError };
};

/** Session detail by ID. */
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

  const session = query.data ?? null;

  return { ...query, session, isOffline: query.isError && !query.data };
};

/** Calendar events in a date range. */
export const useCalendarQuery = (startDate?: string, endDate?: string) => {
  const query = useQuery({
    queryKey: sessionKeys.calendar(startDate, endDate),
    queryFn: async () => {
      const response = await sessionService.getCalendar(startDate, endDate);
      return response.data.data;
    },
    retry: 1,
  });

  const data = (query.data ?? { events: [] }) as CalendarData;

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

/* ============================================================
   Community sessions — free mentoring, 3/month allowance
   ============================================================ */

/** Learner's monthly free community-session allowance (real backend data). */
export const useCommunityAllowanceQuery = () => {
  const query = useQuery({
    queryKey: sessionKeys.communityAllowance(),
    queryFn: async (): Promise<CommunityAllowance> => {
      const response = await sessionService.getCommunityAllowance();
      return response.data.data;
    },
    retry: 1,
  });

  const allowance = query.data ?? null;
  return { ...query, allowance };
};

/** Upcoming free community sessions open for joining. */
export const useUpcomingCommunitySessionsQuery = (page = 0, size = 20) => {
  const query = useQuery({
    queryKey: sessionKeys.communityUpcoming(page, size),
    queryFn: async () => {
      const response = await sessionService.getUpcomingCommunitySessions(page, size);
      return response.data.data;
    },
    retry: 1,
  });

  const data = query.data ?? emptyPage(page, size);
  return { ...query, data, isOffline: query.isError };
};

/** Mentor's real community contribution statistics + recognition level. */
export const useCommunityImpactQuery = (mentorId?: string) => {
  const query = useQuery({
    queryKey: sessionKeys.communityImpact(mentorId ?? 'none'),
    queryFn: async (): Promise<CommunityImpact> => {
      const response = await sessionService.getMentorCommunityImpact(mentorId!);
      return response.data.data;
    },
    enabled: Boolean(mentorId),
    retry: 1,
  });

  const impact = query.data ?? null;
  return { ...query, impact };
};

export const useCreateCommunitySessionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CommunitySessionRequest): Promise<Session> =>
      sessionService.createCommunitySession(payload).then((response) => response.data.data),
    onSuccess: () => {
      showSuccess('Community session scheduled — free for learners to join.');
      void queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};

export const useJoinCommunitySessionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string): Promise<Session> =>
      sessionService.joinCommunitySession(sessionId).then((response) => response.data.data),
    onSuccess: () => {
      showSuccess('You joined the community session — see you there!');
      void queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};
