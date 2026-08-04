import { socketService } from './socket';
import type { AppDispatch } from '@/store';
import {
  participantJoined,
  participantLeft,
  patchParticipant,
  setConnectionStatus,
} from '@/store/slices/meetingSlice';
import type {
  MeetingJoinPayload,
  MeetingSignalPayload,
  MeetingStatePayload,
  MeetingParticipant,
} from '@/types';

/**
 * Meeting signaling layer.
 *
 * Wires meeting-service socket events (join, leave, state, offer,
 * answer, ICE) into the meeting Redux slice. Peer-to-peer media is
 * handled by `webrtc/peer.ts`; this layer only exchanges signaling.
 * When the backend is unreachable the platform falls back to the
 * simulated driver (`webrtc/simulation.ts`).
 */

const SOCKET_ERRORS = {
  CONNECT_ERROR: 'connect_error',
} as const;

export const MEETING_EVENTS = {
  JOIN: 'meeting:join',
  LEAVE: 'meeting:leave',
  STATE: 'meeting:state',
  SIGNAL: 'meeting:signal',
  REACTION: 'meeting:reaction',
} as const;

let boundMeeting: string | null = null;

/** Attach meeting signaling handlers for a room (idempotent per room). */
export const connectMeetingSocket = (dispatch: AppDispatch, meetingId: string): void => {
  if (boundMeeting === meetingId) return;
  if (boundMeeting !== null) disconnectMeetingSocket();
  boundMeeting = meetingId;

  const socket = socketService.connect();

  socket.on(MEETING_EVENTS.JOIN, (payload: MeetingJoinPayload) => {
    if (payload.meetingId !== meetingId) return;
    const participant: MeetingParticipant = {
      ...payload.participant,
      isLocal: false,
      joinedAt: new Date().toISOString(),
    };
    dispatch(participantJoined(participant));
  });

  socket.on(MEETING_EVENTS.LEAVE, (payload: { meetingId: string; participantId: string }) => {
    if (payload.meetingId !== meetingId) return;
    dispatch(participantLeft(payload.participantId));
  });

  socket.on(MEETING_EVENTS.STATE, (payload: MeetingStatePayload) => {
    if (payload.meetingId !== meetingId) return;
    dispatch(
      patchParticipant({
        id: payload.participantId,
        patch: {
          audioEnabled: payload.audioEnabled,
          videoEnabled: payload.videoEnabled,
          screenSharing: payload.screenSharing,
          handRaised: payload.handRaised,
        },
      }),
    );
  });

  // Incoming WebRTC signaling — the peer manager consumes these.
  socket.on(MEETING_EVENTS.SIGNAL, (payload: MeetingSignalPayload & { type: string; data: unknown }) => {
    if (payload.meetingId !== meetingId) return;
    window.dispatchEvent(
      new CustomEvent(`meeting:signal:${meetingId}`, {
        detail: { fromId: payload.fromId, type: payload.type, data: payload.data },
      }),
    );
  });

  socket.on(SOCKET_ERRORS.CONNECT_ERROR, () => {
    dispatch(setConnectionStatus('reconnecting'));
  });
};

/** Detach meeting handlers (leaves the room on the server too). */
export const disconnectMeetingSocket = (): void => {
  if (boundMeeting !== null) {
    socketService.emit(MEETING_EVENTS.LEAVE, { meetingId: boundMeeting, participantId: '' });
    socketService.off(MEETING_EVENTS.JOIN);
    socketService.off(MEETING_EVENTS.LEAVE);
    socketService.off(MEETING_EVENTS.STATE);
    socketService.off(MEETING_EVENTS.SIGNAL);
    boundMeeting = null;
  }
};

/* ---------------- Emitters ---------------- */

export const emitMeetingJoin = (meetingId: string, participant: Omit<MeetingParticipant, 'joinedAt'>): void => {
  socketService.emit(MEETING_EVENTS.JOIN, { meetingId, participant });
};

export const emitMeetingLeave = (meetingId: string, participantId: string): void => {
  socketService.emit(MEETING_EVENTS.LEAVE, { meetingId, participantId });
};

export const emitMeetingState = (meetingId: string, participantId: string, state: Omit<MeetingStatePayload, 'meetingId' | 'participantId'>): void => {
  socketService.emit(MEETING_EVENTS.STATE, { meetingId, participantId, ...state });
};

export const emitMeetingSignal = (meetingId: string, fromId: string, payload: { toId: string; type: string; data: unknown }): void => {
  socketService.emit(MEETING_EVENTS.SIGNAL, { meetingId, fromId, ...payload });
};

export const isMeetingSocketLive = (): boolean => socketService.isConnected();
