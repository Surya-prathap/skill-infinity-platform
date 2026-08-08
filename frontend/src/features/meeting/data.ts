import type { Meeting, MeetingParticipant } from '@/types';

/* ============================================================
   Empty typed defaults — the Meeting Platform renders honest
   empty states until the meeting-service returns real data.
   ============================================================ */

export const MEETING_CURRENT_USER_ID = '';
export const MEETING_CURRENT_USER_NAME = '';

export const seedMeetings: Meeting[] = [];
export const demoMeetingParticipants: MeetingParticipant[] = [];

/** Empty device fallback — the real device list comes from getUserMedia. */
export const fallbackDevices = {
  audioInputs: [] as { deviceId: string; label: string }[],
  videoInputs: [] as { deviceId: string; label: string }[],
  audioOutputs: [] as { deviceId: string; label: string }[],
};
