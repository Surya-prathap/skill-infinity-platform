export const reviewKeys = {
  all: ['reviews'] as const,
  mentor: (mentorId: string, rating?: number, sort: string = 'RECENT') =>
    [...reviewKeys.all, 'mentor', mentorId, rating ?? 'all', sort] as const,
  summary: (mentorId: string) => [...reviewKeys.all, 'summary', mentorId] as const,
  topRated: (limit: number) => [...reviewKeys.all, 'top-rated', limit] as const,
} as const;
