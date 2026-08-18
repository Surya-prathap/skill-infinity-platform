import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';
import { mentorService, sessionService } from '@/services';
import { getErrorMessage, showError, showSuccess } from '@/utils';
import type {
  BookingRequest,
  BookingResponse,
  CancellationRequest,
  CommunityAllowance,
  CommunityImpact,
  CommunitySessionRequest,
  PageResponse,
  RescheduleRequest,
  Session,
} from '@/types';
import { sessionKeys } from './queryKeys';
import { walletKeys } from '@/features/wallet/queryKeys';

const emptyPage = <T,>(page: number, size: number): PageResponse<T> => ({
  content: [],
  page,
  size,
  totalElements: 0,
  totalPages: 1,
  first: page === 0,
  last: true,
  empty: true,
});

/**
 * Upcoming sessions for the authenticated user. `options.silent` marks the
 * request as background — it renders with placeholder data and must not drive
 * the global loading bar (used by the dashboard's widget grid).
 */
export const useUpcomingSessionsQuery = (page = 0, size = 20, options?: { silent?: boolean }) => {
  const config: AxiosRequestConfig | undefined = options?.silent ? { silent: true } : undefined;
  const query = useQuery({
    queryKey: sessionKeys.upcoming(page, size),
    queryFn: async () => {
      const response = await sessionService.getUpcoming(page, size, config);
      return response.data.data;
    },
    retry: 1,
    // Lightweight polling while this page is open: a mentor accepting a
    // booking (or a join window opening) shows up without a browser refresh.
    // React Query stops polling automatically when the component unmounts.
    refetchInterval: 15_000,
  });

  const data = query.data ?? emptyPage(page, size);

  return { ...query, data, isOffline: query.isError };
};

/** Session history (completed / cancelled / rescheduled). */
export const useSessionHistoryQuery = (page = 0, size = 20, options?: { silent?: boolean }) => {
  const config: AxiosRequestConfig | undefined = options?.silent ? { silent: true } : undefined;
  const query = useQuery({
    queryKey: sessionKeys.history(page, size),
    queryFn: async () => {
      const response = await sessionService.getHistory(page, size, config);
      return response.data.data;
    },
    retry: 1,
    refetchInterval: 15_000,
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
    // Keep the details page in sync with backend state (approval, start, end).
    refetchInterval: 15_000,
  });

  const session = query.data ?? null;

  return { ...query, session, isOffline: query.isError && !query.data };
};

/**
 * The session's Discord meeting link. Sessions hold the invite URL that both
 * mentor and learner join in Discord — there is no in-app video room.
 */
export const useSessionMeetingLinkQuery = (sessionId?: string) => {
  const query = useQuery({
    queryKey: sessionKeys.meeting(sessionId ?? 'none'),
    queryFn: async () => {
      const response = await sessionService.getMeetingLink(sessionId!);
      return response.data.data;
    },
    enabled: Boolean(sessionId),
    retry: 1,
  });

  return { ...query, link: query.data ?? null };
};

/* ============================================================
   Mentor availability — real slots for the booking wizard
   ============================================================ */

/**
 * The selected mentor's configured availability (weekly windows + specific
 * dates). Only dates/times inside these windows may be booked — the backend
 * enforces the same rule server-side.
 */
export const useMentorAvailabilityQuery = (mentorId?: string) => {
  const query = useQuery({
    queryKey: ['mentor', 'availability', mentorId ?? 'none'],
    queryFn: async () => {
      const response = await mentorService.getMentorAvailability(mentorId!);
      return response.data.data;
    },
    enabled: Boolean(mentorId),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const availability = query.data ?? [];
  return { ...query, availability, isOffline: query.isError };
};

/* ============================================================
   Booking list queries — mentor dashboard requests & learner requests
   ============================================================ */

/** Booking requests for the authenticated mentor (dashboard Session Requests). */
export const useMentorBookingsQuery = (status?: string, options?: { silent?: boolean }) => {
  const config: AxiosRequestConfig | undefined = options?.silent ? { silent: true } : undefined;
  const query = useQuery({
    queryKey: sessionKeys.mentorBookings(status),
    queryFn: async () => {
      const response = await sessionService.getMentorBookings(status, 0, 50, config);
      return response.data.data;
    },
    retry: 1,
    // Mentor dashboard: new learner requests appear within seconds, and an
    // accepted request disappears from Pending without a browser refresh.
    refetchInterval: 10_000,
  });

  const data = query.data ?? emptyPage(0, 50);
  return { ...query, data, isOffline: query.isError };
};

/** Booking requests raised by the authenticated learner. */
export const useLearnerBookingsQuery = (status?: string) => {
  const query = useQuery({
    queryKey: sessionKeys.learnerBookings(status),
    queryFn: async () => {
      const response = await sessionService.getLearnerBookings(status, 0, 50);
      return response.data.data;
    },
    retry: 1,
    refetchInterval: 10_000,
  });

  const data = query.data ?? emptyPage(0, 50);
  return { ...query, data, isOffline: query.isError };
};

/* ============================================================
   Mutations — booking, reschedule, cancel, lifecycle
   ============================================================ */

/** Mentor accepts a pending booking request. */
export const useApproveBookingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string): Promise<BookingResponse> =>
      sessionService.approveBooking(bookingId).then((response) => response.data.data),
    onSuccess: () => {
      showSuccess('Booking accepted — session scheduled.');
      void queryClient.invalidateQueries({ queryKey: sessionKeys.all });
      void queryClient.invalidateQueries({ queryKey: ['mentor'] });
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};

/** Mentor rejects a pending booking request (credits are released). */
export const useRejectBookingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason?: string }): Promise<BookingResponse> =>
      sessionService.rejectBooking(bookingId, reason).then((response) => response.data.data),
    onSuccess: () => {
      showSuccess('Booking rejected — learner credits released.');
      void queryClient.invalidateQueries({ queryKey: sessionKeys.all });
      // Rejection releases the learner's hold — keep wallet balances in sync.
      void queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};

export const useBookSessionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BookingRequest): Promise<BookingResponse> =>
      sessionService.bookSession(payload).then((response) => response.data.data),
    onSuccess: () => {
      showSuccess('Booking submitted! The mentor will confirm shortly.');
      void queryClient.invalidateQueries({ queryKey: sessionKeys.all });
      // Booking freezes the learner's credits — refresh every wallet screen so
      // the reduced balance is visible immediately.
      void queryClient.invalidateQueries({ queryKey: walletKeys.all });
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
      // Cancellation releases the frozen credits — keep wallet balances in sync.
      void queryClient.invalidateQueries({ queryKey: walletKeys.all });
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
      // Completion finalizes the mentor's earnings / releases the learner's
      // hold — refresh wallet balances so the UI reflects the transfer.
      void queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};

/* ============================================================
   Community sessions — free mentoring, 3/month allowance
   ============================================================ */

/** Learner's monthly free community-session allowance (real backend data). */
export const useCommunityAllowanceQuery = (options?: { silent?: boolean }) => {
  const config: AxiosRequestConfig | undefined = options?.silent ? { silent: true } : undefined;
  const query = useQuery({
    queryKey: sessionKeys.communityAllowance(),
    queryFn: async (): Promise<CommunityAllowance> => {
      const response = await sessionService.getCommunityAllowance(config);
      return response.data.data;
    },
    retry: 1,
  });

  const allowance = query.data ?? null;
  return { ...query, allowance };
};

/** Upcoming free community sessions open for joining. */
export const useUpcomingCommunitySessionsQuery = (page = 0, size = 20, options?: { silent?: boolean }) => {
  const config: AxiosRequestConfig | undefined = options?.silent ? { silent: true } : undefined;
  const query = useQuery({
    queryKey: sessionKeys.communityUpcoming(page, size),
    queryFn: async () => {
      const response = await sessionService.getUpcomingCommunitySessions(page, size, config);
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
      // Joining a paid community session reserves credits (0-credit joins
      // consume the free-session allowance) — refresh wallet + allowance UI.
      void queryClient.invalidateQueries({ queryKey: walletKeys.all });
      void queryClient.invalidateQueries({ queryKey: sessionKeys.communityAllowance() });
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};
