/* ============================================================
   Meeting Platform domain types
   ============================================================ */

export type MeetingKind =
  | 'one-to-one'
  | 'mentor-learner'
  | 'session'
  | 'group'
  | 'instant'
  | 'webinar'
  | 'class';

export type MeetingStatus = 'scheduled' | 'waiting' | 'connecting' | 'in-progress' | 'ended' | 'reconnecting';

export type ParticipantRole = 'HOST' | 'CO_HOST' | 'MENTOR' | 'LEARNER' | 'GUEST';

export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor';

export type MeetingLayout = 'gallery' | 'speaker' | 'presentation' | 'pip' | 'compact';

export interface Meeting {
  id: string;
  title: string;
  kind: MeetingKind;
  hostId: string;
  hostName: string;
  hostRole?: ParticipantRole;
  sessionId?: string;
  conversationId?: string;
  scheduledAt?: string;
  durationMinutes?: number;
  joinUrl?: string;
  password?: string;
  maxParticipants?: number;
  status: MeetingStatus;
  createdAt: string;
}

export interface MeetingParticipant {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role: ParticipantRole;
  isLocal: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenSharing: boolean;
  isSpeaking: boolean;
  handRaised: boolean;
  connectionQuality: ConnectionQuality;
  pinned?: boolean;
  joinedAt: string;
}

export type MediaDeviceKind = 'audioinput' | 'audiooutput' | 'videoinput';

export interface MeetingDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export interface MeetingDeviceSelection {
  audioInput: string;
  audioOutput: string;
  videoInput: string;
}

export interface CallStats {
  latencyMs: number;
  packetLoss: number;
  bitrateKbps: number;
  fps: number;
  resolution: string;
  connectionType: string;
  quality: ConnectionQuality;
}

export type MeetingMessageKind = 'text' | 'file' | 'system';

export interface MeetingMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  kind: MeetingMessageKind;
  createdAt: string;
  reactions?: string[];
  pinned?: boolean;
}

export interface MeetingReaction {
  id: string;
  emoji: string;
  userName: string;
  userId: string;
  createdAt: string;
}

export interface MeetingError {
  code: string;
  title: string;
  message: string;
}

/* ---------------- Signaling payloads ---------------- */

export interface MeetingSignalPayload {
  meetingId: string;
  fromId: string;
  [key: string]: unknown;
}

export interface MeetingJoinPayload {
  meetingId: string;
  participant: Omit<MeetingParticipant, 'joinedAt'>;
}

export interface MeetingStatePayload {
  meetingId: string;
  participantId: string;
  audioEnabled?: boolean;
  videoEnabled?: boolean;
  screenSharing?: boolean;
  handRaised?: boolean;
}
