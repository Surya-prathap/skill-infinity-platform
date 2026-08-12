export const sessionKeys = {
  all: ['sessions'] as const,
  upcoming: (page: number, size: number) =>
    [...sessionKeys.all, 'upcoming', page, size] as const,
  history: (page: number, size: number) =>
    [...sessionKeys.all, 'history', page, size] as const,
  detail: (sessionId: string) => [...sessionKeys.all, 'detail', sessionId] as const,
  calendar: (startDate?: string, endDate?: string) =>
    [...sessionKeys.all, 'calendar', startDate ?? '', endDate ?? ''] as const,
  meeting: (sessionId: string) => [...sessionKeys.all, 'meeting', sessionId] as const,
  communityAllowance: () => [...sessionKeys.all, 'community', 'allowance'] as const,
  communityUpcoming: (page: number, size: number) =>
    [...sessionKeys.all, 'community', 'upcoming', page, size] as const,
  communityImpact: (mentorId: string) => [...sessionKeys.all, 'community', 'impact', mentorId] as const,
} as const;
