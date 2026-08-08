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
import { meetingService } from '@/services';
import { showError } from '@/utils';
import { meetingKeys } from './queryKeys';
import type { AuthUser, Meeting, MeetingError, MeetingParticipant } from '@/types';

/* ---------------- Meetings ---------------- */

export const useMeetingQuery = (meetingId: string | null) => {
  const query = useQuery({
    queryKey: meetingKeys.detail(meetingId ?? 'none'),
    queryFn: async () => {
      const response = await meetingService.getMeeting(meetingId!);
      return response.data.data;
    },
    enabled: Boolean(meetingId),
    retry: 1,
  });

  return { ...query, meeting: query.data ?? null, isOffline: query.isError };
};

export const useUpcomingMeetingsQuery = () => {
  const query = useQuery({
    queryKey: meetingKeys.upcoming(),
    queryFn: async () => {
      const response = await meetingService.getUpcomingMeetings();
      return response.data.data;
    },
    retry: 1,
  });

  return { ...query, meetings: query.data ?? [], isOffline: query.isError };
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
