/**
 * Session domain types — mirror the session-service DTOs
 * (SessionResponse, BookingResponse, CalendarResponse, MeetingResponse,
 * BookingRequest, RescheduleRequestDto, CancellationRequest).
 */

export type SessionStatus =
  | 'SCHEDULED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'CONFIRMED'
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'RESCHEDULED'
  | 'NO_SHOW'
  | 'EXPIRED';

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
  /** True for community mentoring sessions. */
  community?: boolean;
  /** Number of participants (community sessions). */
  participantCount?: number;
  /** Learner capacity of a community session (1–20). */
  maxParticipants?: number;
  /** Learners currently joined (excludes the host). */
  learnerCount?: number;
  /** Seats left before the session is full (0 = full). */
  remainingSeats?: number;
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
  /** When the join window opens (start minus the join window), per the backend. */
  joinAvailableAt?: string;
  /** Backend-computed: may the current user join right now? */
  joinAllowed?: boolean;
  /** Backend-computed: is a meeting link stored for this session? */
  sessionLinkAvailable?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/* ---------------- Request payloads (mirror backend) ---------------- */

export interface BookingRequest {
  mentorId: string;
  learnerId?: string;
  mentorName?: string;
  learnerName?: string;
  /** Learner email — used for booking status notifications (stored with the booking). */
  learnerEmail?: string;
  topic: string;
  description?: string;
  preferredDate?: string;
  preferredStartTime: string;
  preferredEndTime: string;
  durationMinutes: number;
  /** Selected mentor pricing plan — the backend computes the real cost. */
  pricingId?: string;
  /** Session cost in credits (1 credit = 10 minutes) — informational only. */
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
  /** Cost in credits (0–3). 0 = TRUE FREE session. */
  cost: number;
  /** Max learners (1–20). */
  maxParticipants: number;
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
  learnerEmail?: string;
  topic?: string;
  description?: string;
  preferredDate?: string;
  preferredStartTime?: string;
  preferredEndTime?: string;
  durationMinutes?: number;
  /** Session cost in credits (0 for free/community). */
  price?: number;
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
