import { useCallback, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addMessage,
  joinMeeting,
  leaveMeeting,
  resetMeeting,
  setControl,
  setDevices,
  setMeetingError,
} from '@/store/slices/meetingSlice';
import { selectMeetingControls, selectMeetingStatus, selectUser } from '@/store/selectors';
import { meetingService, sessionService } from '@/services';
import { showError } from '@/utils';
import { meetingKeys } from './queryKeys';
import type { AuthUser, Meeting, MeetingError, MeetingInfo, MeetingParticipant, Session } from '@/types';

/* ---------------- Session → Meeting mapping ---------------- */

/**
 * The platform's meetings ARE sessions: the session-service owns the meeting
 * link for every booked/community session and its joinUrl points at the
 * in-app meeting room (/meet/{sessionId}). This maps a session (+ its meeting
 * link) onto the Meeting model used by the meeting room.
 */
export const buildSessionMeeting = (session: Session, link?: MeetingInfo | null): Meeting => {
  const joinPath = link?.joinUrl ?? `/meet/${session.id}`;
  const inProgress = session.status === 'IN_PROGRESS';
  return {
    id: session.id,
    title: session.topic ?? session.title ?? 'Mentoring session',
    kind: 'session',
    sessionId: session.id,
    hostId: session.mentorId,
    hostName: session.mentorName ?? 'Mentor',
    hostRole: 'MENTOR',
    scheduledAt: session.startTime,
    durationMinutes: session.durationMinutes,
    joinUrl: joinPath,
    password: link?.password,
    maxParticipants: Math.max(25, (session.participantCount ?? 0) + 5),
    status: inProgress ? 'in-progress' : 'scheduled',
    createdAt: session.createdAt ?? new Date().toISOString(),
  };
};

/** Sample meetings shown only when the API is unreachable (demo mode). */
export const DEMO_UPCOMING_MEETINGS: Meeting[] = [
  {
    id: 'meet-demo-1',
    title: 'System Design Deep Dive',
    kind: 'session',
    hostId: 'meet-sarah',
    hostName: 'Sarah Chen',
    hostRole: 'MENTOR',
    sessionId: 'demo-session-1',
    scheduledAt: new Date(Date.now() + 86_400_000).toISOString(),
    durationMinutes: 60,
    joinUrl: '/meet/meet-demo-1',
    maxParticipants: 25,
    status: 'scheduled',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'meet-demo-2',
    title: 'Java Spring Boot Crash Course',
    kind: 'session',
    hostId: 'meet-james',
    hostName: 'James Carter',
    hostRole: 'MENTOR',
    sessionId: 'demo-session-2',
    scheduledAt: new Date(Date.now() + 172_800_000).toISOString(),
    durationMinutes: 45,
    joinUrl: '/meet/meet-demo-2',
    maxParticipants: 25,
    status: 'scheduled',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'meet-demo-3',
    title: 'Frontend Performance Workshop',
    kind: 'session',
    hostId: 'meet-priya',
    hostName: 'Priya Sharma',
    hostRole: 'MENTOR',
    sessionId: 'demo-session-3',
    scheduledAt: new Date(Date.now() + 259_200_000).toISOString(),
    durationMinutes: 90,
    joinUrl: '/meet/meet-demo-3',
    maxParticipants: 25,
    status: 'scheduled',
    createdAt: new Date().toISOString(),
  },
];

/* ---------------- Meetings ---------------- */

/**
 * Resolves a meeting by id. Meetings are first looked up on the meeting API;
 * when the id belongs to a session (the platform's real meetings), the
 * session-service is consulted instead so /meet/{sessionId} always works.
 */
/** Session ids are UUIDs — instant/demo meetings use other id formats. */
const isSessionUuid = (id: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export const useMeetingQuery = (meetingId: string | null) => {
  const query = useQuery({
    queryKey: meetingKeys.detail(meetingId ?? 'none'),
    queryFn: async () => {
      try {
        const response = await meetingService.getMeeting(meetingId!);
        return response.data.data;
      } catch {
        // Only fall back to the session meeting link when the id could be a
        // real session UUID — instant/demo meetings (e.g. "meet-instant-…")
        // have no session behind them, and session-service rejects non-UUID
        // ids with a 500. This keeps the console/network free of error spam
        // for the instant-meeting flow (the store copy drives the room).
        if (!isSessionUuid(meetingId ?? '')) {
          throw new Error(`No session meeting for ${meetingId}`);
        }
        const [sessionResult, linkResult] = await Promise.allSettled([
          sessionService.getSession(meetingId!),
          meetingService.getMeetingForSession(meetingId!),
        ]);
        if (sessionResult.status === 'rejected') throw sessionResult.reason;
        const session = sessionResult.value.data.data;
        const link = linkResult.status === 'fulfilled' ? linkResult.value.data.data : undefined;
        return buildSessionMeeting(session, link);
      }
    },
    enabled: Boolean(meetingId),
    // No retry: the session fallback below already handles missing meetings,
    // and retrying only multiplies requests against the unrouted /meetings API.
    retry: 0,
  });

  return { ...query, meeting: query.data ?? null, isOffline: query.isError };
};

/** Upcoming meetings — real sessions with active meeting links (demo fallback). */
export const useUpcomingMeetingsQuery = () => {
  const query = useQuery({
    queryKey: meetingKeys.upcoming(),
    queryFn: async (): Promise<{ meetings: Meeting[]; offline: boolean }> => {
      try {
        const response = await sessionService.getUpcoming(0, 20);
        const sessions = response.data.data?.content ?? [];
        const meetings = sessions
          .filter((session) =>
            ['SCHEDULED', 'CONFIRMED', 'PENDING', 'IN_PROGRESS'].includes(session.status),
          )
          .map((session) => buildSessionMeeting(session, session.meetingLink));
        return { meetings, offline: false };
      } catch {
        return { meetings: DEMO_UPCOMING_MEETINGS, offline: true };
      }
    },
    retry: 1,
    staleTime: 60_000,
  });

  return {
    ...query,
    meetings: query.data?.meetings ?? [],
    isOffline: query.data?.offline ?? query.isError,
  };
};

/* ---------------- Session meeting link ---------------- */

export const useSessionMeetingQuery = (sessionId: string | null) => {
  const query = useQuery({
    queryKey: meetingKeys.sessionMeeting(sessionId ?? 'none'),
    queryFn: async () => {
      const response = await meetingService.getMeetingForSession(sessionId!);
      return response.data.data;
    },
    enabled: Boolean(sessionId),
    retry: 1,
  });

  return { ...query, meeting: query.data ?? null, isOffline: query.isError };
};

/* ---------------- Local participant ---------------- */

export const buildLocalParticipant = (
  user: AuthUser,
  meeting: Meeting | null,
  isHost = false,
  role: MeetingParticipant['role'] = 'LEARNER',
): MeetingParticipant => ({
  id: user.userId,
  name: user.username || user.email,
  email: user.email,
  role: isHost ? 'HOST' : meeting?.hostId === user.userId ? 'HOST' : role,
  isLocal: true,
  audioEnabled: true,
  videoEnabled: true,
  screenSharing: false,
  isSpeaking: false,
  handRaised: false,
  connectionQuality: 'excellent',
  joinedAt: new Date().toISOString(),
});

/* ---------------- Join / leave orchestration ---------------- */

interface JoinMeetingOptions {
  role?: MeetingParticipant['role'];
  /** When true the user joins with camera+mic muted (safer demo default). */
  mutedJoin?: boolean;
}

export const useJoinMeeting = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const user = useAppSelector(selectUser);
  const joinedRef = useRef<string | null>(null);

  const join = useCallback(
    (meeting: Meeting, options: JoinMeetingOptions = {}) => {
      if (!user || joinedRef.current === meeting.id) return;
      joinedRef.current = meeting.id;

      const participant = buildLocalParticipant(user, meeting, false, options.role);
      if (options.mutedJoin) {
        participant.audioEnabled = false;
        participant.videoEnabled = false;
      }
      dispatch(joinMeeting({ meeting, participant }));
      // Keep the meeting controls in sync with the join mode so the room's
      // toggle buttons AND the freshly acquired media tracks respect a muted
      // join (otherwise the camera LED would stay on while the UI says off).
      dispatch(setControl({ key: 'micOn', value: !options.mutedJoin }));
      dispatch(setControl({ key: 'camOn', value: !options.mutedJoin }));
      dispatch(
        addMessage({
          id: `meet-local-join-${Date.now()}`,
          senderId: user.userId,
          senderName: user.username || user.email,
          content: 'You joined the meeting',
          kind: 'system',
          createdAt: new Date().toISOString(),
        }),
      );
      void queryClient.invalidateQueries({ queryKey: meetingKeys.all });
    },
    [dispatch, queryClient, user],
  );

  const leave = useCallback(() => {
    dispatch(leaveMeeting());
    dispatch(setControl({ key: 'micOn', value: true }));
    dispatch(setControl({ key: 'camOn', value: true }));
    joinedRef.current = null;
  }, [dispatch]);

  const end = useCallback(() => {
    dispatch(resetMeeting());
    joinedRef.current = null;
  }, [dispatch]);

  return { join, leave, end };
};

/* ---------------- Meeting error mapping ---------------- */

export const useMeetingError = (): { error: MeetingError | null; clearError: () => void } => {
  const dispatch = useAppDispatch();
  const error = useAppSelector((state) => state.meeting.error);
  const clearError = useCallback(() => dispatch(setMeetingError(null)), [dispatch]);
  return { error, clearError };
};

/* ---------------- Device mutation ---------------- */

export const useDeviceSettingsMutation = () => {
  const dispatch = useAppDispatch();

  const save = useCallback(
    (devices: { audioInput: string; audioOutput: string; videoInput: string }) => {
      dispatch(setDevices(devices));
      meetingService.saveDevicePreferences(devices).catch(() => showError('Could not save device preferences.'));
    },
    [dispatch],
  );

  return { save };
};

/* ---------------- Meeting status selector hook ---------------- */

export const useMeetingStatus = () => useAppSelector(selectMeetingStatus);
export const useMeetingControls = () => useAppSelector(selectMeetingControls);

/* ---------------- Meeting availability ---------------- */

export const useMeetingInProgress = (): boolean => useAppSelector(selectMeetingStatus) === 'in-progress';

/* ---------------- Silent meeting fetch (join by URL) ---------------- */

export const useResolveMeeting = (meetingId: string | null) => {
  const { meeting, isOffline } = useMeetingQuery(meetingId);
  const resolved = useMemo(() => meeting ?? null, [meeting]);
  return { meeting: resolved, isOffline };
};
