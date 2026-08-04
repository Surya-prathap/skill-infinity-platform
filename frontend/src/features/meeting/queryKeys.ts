export const meetingKeys = {
  all: ['meeting'] as const,
  detail: (meetingId: string) => ['meeting', 'detail', meetingId] as const,
  upcoming: () => ['meeting', 'upcoming'] as const,
  sessionMeeting: (sessionId: string) => ['meeting', 'session', sessionId] as const,
  signaling: (meetingId: string) => ['meeting', 'signaling', meetingId] as const,
};
