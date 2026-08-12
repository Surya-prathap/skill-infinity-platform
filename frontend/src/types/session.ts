/**
 * Session domain types — mirror the session-service DTOs
 * (SessionResponse, BookingResponse, CalendarResponse, MeetingResponse,
 * BookingRequest, RescheduleRequestDto, CancellationRequest).
 */

export type SessionStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RESCHEDULED'
  | 'NO_SHOW';

export type BookingStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface MeetingInfo {
  id?: string;
  provider?: string;
  meetingId?: string;
  meetingUrl?: string;
  joinUrl?: string;
  startUrl?: string;
  password?: string;
  active?: boolean;
}

export interface Session {
  id: string;
  title?: string;
  description?: string;
  mentorId: string;
  learnerId: string;
  mentorName?: string;
  learnerName?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes: number;
  timezone?: string;
  status: SessionStatus;
  topic?: string;
  category?: string;
  price?: number;
  currency?: string;
  free?: boolean;
  /** True for free community mentoring sessions. */
  community?: boolean;
  /** Number of participants (community sessions). */
  participantCount?: number;
  recordingUrl?: string;
  notes?: string;
  outcome?: string;
  rating?: number;
  feedback?: string;
  cancellationReason?: string;
  rescheduleCount?: number;
  completedAt?: string;
  startedAt?: string;
  endedAt?: string;
  meetingLink?: MeetingInfo;
  createdAt?: string;
  updatedAt?: string;
}

export interface CalendarEvent {
  id: string;
  sessionId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  timezone?: string;
  location?: string;
  provider?: string;
}

export interface CalendarData {
  events: CalendarEvent[];
  icsContent?: string;
}

/* ---------------- Request payloads (mirror backend) ---------------- */

export interface BookingRequest {
  mentorId: string;
  learnerId?: string;
  mentorName?: string;
  learnerName?: string;
  topic: string;
  description?: string;
  preferredDate?: string;
  preferredStartTime: string;
  preferredEndTime: string;
  durationMinutes: number;
  /** Session cost in credits (1 credit = 10 minutes). */
  credits?: number;
  timezone?: string;
  learnerMessage?: string;
}

export interface CommunitySessionRequest {
  topic: string;
  description?: string;
  startTime: string;
  endTime: string;
  timezone?: string;
  maxParticipants?: number;
}

export interface CommunityAllowance {
  limit: number;
  used: number;
  remaining: number;
  month: string;
}

export interface CommunityImpact {
  completedSessions: number;
  learnersHelped: number;
  communityHours: number;
  level: number;
  levelLabel?: string | null;
  nextLevelAt: number;
  nextLevelLabel?: string | null;
}

export interface BookingResponse {
  id: string;
  mentorId: string;
  learnerId: string;
  sessionId?: string;
  mentorName?: string;
  learnerName?: string;
  topic?: string;
  description?: string;
  preferredDate?: string;
  preferredStartTime?: string;
  preferredEndTime?: string;
  durationMinutes?: number;
  timezone?: string;
  status: BookingStatus;
  mentorMessage?: string;
  learnerMessage?: string;
  rejectionReason?: string;
  approvedAt?: string;
  rejectedAt?: string;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RescheduleRequest {
  sessionId: string;
  proposedStartTime: string;
  proposedEndTime: string;
  reason?: string;
}

export interface CancellationRequest {
  sessionId: string;
  reason?: string;
  cancellationType?: 'VOLUNTARY' | 'INVOLUNTARY' | 'NO_SHOW';
}

export interface SessionFilters {
  status?: SessionStatus;
  query?: string;
  page?: number;
  size?: number;
}
