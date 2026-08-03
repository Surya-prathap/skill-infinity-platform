export const mentorKeys = {
  all: ['mentor'] as const,
  profile: () => [...mentorKeys.all, 'profile'] as const,
  dashboard: () => [...mentorKeys.all, 'dashboard'] as const,
  availability: () => [...mentorKeys.all, 'availability'] as const,
  pricing: (mentorId: string) => [...mentorKeys.all, 'pricing', mentorId] as const,
  expertise: (mentorId: string) => [...mentorKeys.all, 'expertise', mentorId] as const,
  categories: () => [...mentorKeys.all, 'categories'] as const,
} as const;
