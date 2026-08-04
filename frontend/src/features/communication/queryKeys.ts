export const communicationKeys = {
  all: ['communication'] as const,
  conversations: () => [...communicationKeys.all, 'conversations'] as const,
  conversation: (conversationId: string) =>
    [...communicationKeys.all, 'conversation', conversationId] as const,
  history: (conversationId: string, page: number, size: number) =>
    [...communicationKeys.all, 'history', conversationId, page, size] as const,
  search: (query: string) => [...communicationKeys.all, 'search', query] as const,
  presence: (userId: string) => [...communicationKeys.all, 'presence', userId] as const,
  announcements: () => [...communicationKeys.all, 'announcements'] as const,
} as const;
