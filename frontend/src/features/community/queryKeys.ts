export const communityKeys = {
  all: ['community'] as const,
  communities: (category?: string, tag?: string) =>
    [...communityKeys.all, 'communities', category ?? '', tag ?? ''] as const,
  community: (communityId: string) =>
    [...communityKeys.all, 'community', communityId] as const,
  myCommunities: () => [...communityKeys.all, 'my-communities'] as const,
  /** Feed keys are stable across pages — pagination lives inside the infinite query data. */
  feed: (filter: string, size: number) =>
    [...communityKeys.all, 'feed', filter, size] as const,
  communityPosts: (communityId: string, size: number) =>
    [...communityKeys.all, 'community-posts', communityId, size] as const,
  post: (postId: string) => [...communityKeys.all, 'post', postId] as const,
  trending: (limit: number) => [...communityKeys.all, 'trending', limit] as const,
  pinned: (communityId?: string) =>
    [...communityKeys.all, 'pinned', communityId ?? ''] as const,
  comments: (postId: string) => [...communityKeys.all, 'comments', postId] as const,
  search: (query: string) => [...communityKeys.all, 'search', query] as const,
  leaderboard: (category: string, range: string) =>
    [...communityKeys.all, 'leaderboard', category, range] as const,
  activity: (limit: number) => [...communityKeys.all, 'activity', limit] as const,
  achievements: () => [...communityKeys.all, 'achievements'] as const,
  learningStats: () => [...communityKeys.all, 'learning-stats'] as const,
  popularTags: () => [...communityKeys.all, 'popular-tags'] as const,
} as const;
