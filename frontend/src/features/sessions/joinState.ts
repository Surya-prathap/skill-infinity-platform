/**
 * Session join state — ONE authoritative rule, enforced by the backend.
 *
 * The backend (session-service) computes the join window from SERVER time:
 *   joinAllowedFrom = startTime - JOIN_WINDOW_MINUTES
 *   joinAllowed      = now >= joinAllowedFrom && now <= endTime
 *                      && status in (SCHEDULED, APPROVED, IN_PROGRESS)
 *
 * The backend also guarantees a meeting link exists by the time the window
 * opens, and returns it explicitly (`joinAllowed`, `joinAvailableAt`,
 * `sessionLinkAvailable`) on every session response. The frontend consumes
 * that state; local timestamp math is used ONLY as a fallback for stale data
 * and for display/countdown purposes — never as the authorization.
 */
import dayjs from 'dayjs';
import { sessionService } from '@/services';
import type { Session } from '@/types';
import { getErrorMessage, parseApiTime, showError } from '@/utils';

export const JOIN_WINDOW_MINUTES = 10;

/** Terminal / non-joinable states that end the session's lifecycle. */
const TERMINAL_STATUSES = ['COMPLETED', 'CANCELLED', 'REJECTED', 'NO_SHOW', 'EXPIRED'] as const;

export interface JoinState {
  /** True when the session is inside the join window AND not finished. */
  eligible: boolean;
  /** Human message shown when not eligible (or undefined when joinable). */
  message?: string;
  /** Backend-provided time the join window opens (start - join window). */
  joinAvailableAt?: string;
}

/** Message for a status-based rejection (pending / rejected / finished). */
const statusMessage = (status: string): string | undefined => {
  if (status === 'PENDING' || status === 'PENDING_APPROVAL') {
    return 'Waiting for mentor approval.';
  }
  if (status === 'REJECTED') {
    return 'Session request was rejected.';
  }
  if (TERMINAL_STATUSES.includes(status as (typeof TERMINAL_STATUSES)[number])) {
    return 'Session has ended.';
  }
  return undefined;
};

/** Time-based message, mirroring the backend rule (start - 10 min → end). */
const windowMessage = (session: Session): { message?: string; joinAvailableAt?: string } => {
  if (!session.startTime || !session.endTime) return {};
  const start = parseApiTime(session.startTime);
  const end = parseApiTime(session.endTime);
  if (!start || !end) return {};
  const now = dayjs();
  if (now.isBefore(start.subtract(JOIN_WINDOW_MINUTES, 'minute'))) {
    return {
      joinAvailableAt: start.subtract(JOIN_WINDOW_MINUTES, 'minute').toISOString(),
      message: `Join will be available ${JOIN_WINDOW_MINUTES} minutes before the session.`,
    };
  }
  if (now.isAfter(end)) {
    return { message: 'Session has ended.' };
  }
  return {};
};

/**
 * Resolves a session's join eligibility. The BACKEND is the source of truth:
 * when the response carries `joinAllowed` (boolean), that value wins. Local
 * timestamp math is only a fallback for responses without it.
 */
export const getSessionJoinState = (session: Session): JoinState => {
  const statusMsg = statusMessage(session.status);
  if (statusMsg) {
    return { eligible: false, message: statusMsg };
  }

  // Backend-computed join state — trust it over any local math. The Join
  // button stays visible whenever the window is open (it must never be
  // removed). When the backend has no real invite configured it answers
  // "Meeting link is not available yet." on Join — never Discord Home.
  if (typeof session.joinAllowed === 'boolean') {
    if (session.joinAllowed) {
      return { eligible: true, joinAvailableAt: session.joinAvailableAt };
    }
    return { eligible: false, ...windowMessage(session) };
  }

  // Fallback (older responses / cached data): identical rule to the backend.
  if (!session.startTime || !session.endTime) {
    return { eligible: false };
  }
  const start = parseApiTime(session.startTime);
  const end = parseApiTime(session.endTime);
  if (!start || !end) {
    return { eligible: false };
  }
  const now = dayjs();
  if (now.isBefore(start.subtract(JOIN_WINDOW_MINUTES, 'minute'))) {
    return {
      eligible: false,
      joinAvailableAt: start.subtract(JOIN_WINDOW_MINUTES, 'minute').toISOString(),
      message: `Join will be available ${JOIN_WINDOW_MINUTES} minutes before the session.`,
    };
  }
  if (now.isAfter(end)) {
    return { eligible: false, message: 'Session has ended.' };
  }
  // In the window but no real link (missing config) — never show Join.
  if (session.sessionLinkAvailable === false) {
    return { eligible: false, message: 'Meeting link is not available yet.' };
  }
  return { eligible: true };
};

/** "Join Now" before the session starts, "Join Session" once it is running. */
export const getJoinButtonLabel = (session: Session): string => {
  if (session.startTime) {
    const start = parseApiTime(session.startTime);
    if (start && dayjs().isAfter(start)) {
      return 'Join Session';
    }
  }
  return 'Join Now';
};

/**
 * True only for real Discord invite URLs — the two valid forms Discord
 * generates (discord.gg/<code> and discord.com/invite/<code>). NEVER Discord
 * Home (discord.com/, discord.com/channels/@me, …) and never a fabricated
 * code. A random string is not a Discord invite.
 */
export const isDiscordInviteUrl = (url: string | null | undefined): url is string => {
  if (!url) return false;
  const trimmed = url.trim();
  return (
    /^https:\/\/discord\.gg\/[a-zA-Z0-9-]+/.test(trimmed) ||
    /^https:\/\/discord\.com\/invite\/[a-zA-Z0-9-]+/.test(trimmed)
  );
};

/**
 * The session's stored Discord invite URL (joinUrl preferred, meetingUrl as
 * fallback). Returns null when no valid invite exists so callers can show
 * "Meeting link is not available yet." instead of opening a dead tab.
 */
export const getSessionMeetingUrl = (session: Session): string | null => {
  const link = session.meetingLink;
  const url = link?.joinUrl || link?.meetingUrl;
  return isDiscordInviteUrl(url) ? url : null;
};

/**
 * Joins a session by asking the BACKEND for the meeting link first. The
 * backend verifies the caller belongs to the session and that the current
 * server time is inside the join window, so the frontend never opens Discord
 * on its own authority. The returned URL is the same stored invite for both
 * participants — never regenerated, never Discord Home.
 */
export const joinSessionMeeting = async (sessionId: string): Promise<void> => {
  try {
    const response = await sessionService.getMeetingLink(sessionId);
    const link = response.data.data;
    const url = link?.joinUrl || link?.meetingUrl;
    if (!isDiscordInviteUrl(url)) {
      showError('Meeting link is not available yet.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  } catch (error) {
    // Backend already returns the exact human message, e.g.
    // "Join will be available 10 minutes before the session." or
    // "Session has ended." — surface it as-is.
    showError(getErrorMessage(error));
  }
};
