export const marketplaceKeys = {
  all: ['marketplace'] as const,
  search: (params: object) =>
    [...marketplaceKeys.all, 'search', JSON.stringify(params)] as const,
  mentor: (mentorId: string) => [...marketplaceKeys.all, 'mentor', mentorId] as const,
  publicMentor: (mentorId: string) =>
    [...marketplaceKeys.all, 'public', mentorId] as const,
  categories: () => [...marketplaceKeys.all, 'categories'] as const,
  topRated: () => [...marketplaceKeys.all, 'top-rated'] as const,
} as const;
