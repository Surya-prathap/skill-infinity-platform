import { useEffect, useMemo } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { communityService } from '@/services';
import { reviewService } from '@/services';
import { getErrorMessage, showError, showInfo, showSuccess } from '@/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearDraft as clearDraftAction, saveDraft as saveDraftAction } from '@/store/slices/communitySlice';
import { selectCommunityDraft } from '@/store/selectors';
import { connectCommunitySocket, emitCommunityLike, emitCommunityPost, simulateLiveFeed } from '@/socket';
import { useDebounce } from '@/hooks';
import { communityKeys } from './queryKeys';
import {
  CURRENT_USER_ID,
  CURRENT_USER_NAME,
  seedAchievements,
  seedActivity,
  seedCategories,
  seedComments,
  seedCommunities,
  seedLearningStats,
  seedLeaderboard,
  seedPosts,
  seedReviewsByMentor,
  seedTags,
} from './data';
import type {
  Achievement,
  ActivityItem,
  Community,
  CommunityCategory,
  CommunityComment,
  CommunityPost,
  CreateCommentRequest,
  CreatePostRequest,
  FeedFilter,
  LeaderboardCategory,
  LeaderboardEntry,
  LeaderboardRange,
  LearningStats,
  PageResponse,
  RatingBreakdown,
  Review,
  ReviewDimensionRatings,
  ReviewRequest,
  Tag,
} from '@/types';

const PAGE_SIZE = 6;

/* ============================================================
   Cache helpers — single source of truth for post updates
   ============================================================ */

/** Applies `updater` to every cached shape that contains the post. */
const updatePostInCaches = (
  queryClient: QueryClient,
  postId: string,
  updater: (post: CommunityPost) => CommunityPost,
): void => {
  // Keep the module-level seed in sync so offline fallback reads stay optimistic.
  const seedIndex = seedPosts.findIndex((post) => post.id === postId);
  if (seedIndex >= 0 && seedPosts[seedIndex]) {
    Object.assign(seedPosts[seedIndex]!, updater(seedPosts[seedIndex]!));
  }
  queryClient.setQueriesData<unknown>({ queryKey: communityKeys.all }, (oldData: unknown) => {
    if (!oldData || typeof oldData !== 'object') return oldData;
    // Infinite feed shape: { pages: PageResponse<T>[] }
    const asInfinite = oldData as { pages?: PageResponse<CommunityPost>[] };
    if (Array.isArray(asInfinite.pages)) {
      return {
        ...(oldData as object),
        pages: asInfinite.pages.map((page) => ({
          ...page,
          content: page.content.map((post) => (post.id === postId ? updater(post) : post)),
        })),
      };
    }
    // PageResponse shape
    const asPage = oldData as PageResponse<CommunityPost>;
    if (Array.isArray(asPage.content) && 'totalElements' in asPage) {
      return { ...asPage, content: asPage.content.map((post) => (post.id === postId ? updater(post) : post)) };
    }
    // Plain array shape (trending / pinned)
    if (Array.isArray(oldData)) {
      return oldData.map((item) =>
        item && typeof item === 'object' && (item as CommunityPost).id === postId
          ? updater(item as CommunityPost)
          : item,
      );
    }
    // Single post
    if ((oldData as CommunityPost).id === postId) return updater(oldData as CommunityPost);
    return oldData;
  });
};

const getPostFromCaches = (queryClient: QueryClient, postId: string): CommunityPost | null => {
  const cached = queryClient.getQueriesData<unknown>({ queryKey: communityKeys.all });
  for (const [, oldData] of cached) {
    if (!oldData || typeof oldData !== 'object') continue;
    const asInfinite = oldData as { pages?: PageResponse<CommunityPost>[] };
    if (Array.isArray(asInfinite.pages)) {
      for (const page of asInfinite.pages) {
        const hit = page.content.find((post) => post.id === postId);
        if (hit) return hit;
      }
      continue;
    }
    const asPage = oldData as PageResponse<CommunityPost>;
    if (Array.isArray(asPage.content) && 'totalElements' in asPage) {
      const hit = asPage.content.find((post) => post.id === postId);
      if (hit) return hit;
      continue;
    }
    if (Array.isArray(oldData)) {
      const hit = (oldData as CommunityPost[]).find((post) => post.id === postId);
      if (hit) return hit;
      continue;
    }
    if ((oldData as CommunityPost).id === postId) return oldData as CommunityPost;
  }
  return null;
};

/** Applies `updater` to every cached shape that contains the community. */
const updateCommunityInCaches = (
  queryClient: QueryClient,
  communityId: string,
  updater: (community: Community) => Community,
): void => {
  // Keep the module-level seed in sync so offline fallback reads stay optimistic.
  const seedIndex = seedCommunities.findIndex((c) => c.id === communityId);
  if (seedIndex >= 0 && seedCommunities[seedIndex]) {
    Object.assign(seedCommunities[seedIndex]!, updater(seedCommunities[seedIndex]!));
  }
  queryClient.setQueriesData<unknown>({ queryKey: communityKeys.all }, (oldData: unknown) => {
    if (!oldData || typeof oldData !== 'object') return oldData;
    const asPage = oldData as PageResponse<Community>;
    if (Array.isArray(asPage.content) && 'totalElements' in asPage) {
      return { ...asPage, content: asPage.content.map((c) => (c.id === communityId ? updater(c) : c)) };
    }
    if (Array.isArray(oldData)) {
      return oldData.map((item) =>
        item && typeof item === 'object' && (item as Community).id === communityId
          ? updater(item as Community)
          : item,
      );
    }
    if ((oldData as Community).id === communityId) return updater(oldData as Community);
    return oldData;
  });
};

const updateCommentInCache = (
  queryClient: QueryClient,
  postId: string,
  commentId: string,
  updater: (comment: CommunityComment) => CommunityComment,
): void => {
  // Keep the module-level seed in sync so offline fallback reads stay optimistic.
  const seedList = seedComments[postId];
  if (seedList) {
    const seedIndex = seedList.findIndex((c) => c.id === commentId);
    if (seedIndex >= 0 && seedList[seedIndex]) {
      Object.assign(seedList[seedIndex]!, updater(seedList[seedIndex]!));
    }
  }
  queryClient.setQueryData<CommunityComment[]>(communityKeys.comments(postId), (old) =>
    old?.map((comment) => (comment.id === commentId ? updater(comment) : comment)) ?? old,
  );
};

/** Offline-first: prefer the API but keep optimistic UI when the backend is unreachable. */
const offline = <T>(promise: Promise<T>, fallback: () => T): Promise<T> =>
  promise.catch(() => fallback());

/* ============================================================
   Seed projections
   ============================================================ */

const paginate = (list: CommunityPost[], size: number): PageResponse<CommunityPost>[] => {
  const pages: PageResponse<CommunityPost>[] = [];
  for (let start = 0; start < list.length; start += size) {
    const content = list.slice(start, start + size);
    pages.push({
      content,
      page: pages.length,
      size,
      totalElements: list.length,
      totalPages: Math.max(1, Math.ceil(list.length / size)),
      first: pages.length === 0,
      last: start + size >= list.length,
      empty: content.length === 0,
    });
  }
  return pages.length > 0 ? pages : [{ content: [], page: 0, size, totalElements: 0, totalPages: 1, first: true, last: true, empty: true }];
};

const sortSeedPosts = (list: CommunityPost[], filter: FeedFilter): CommunityPost[] => {
  const copy = [...list];
  switch (filter) {
    case 'TRENDING':
      return copy.sort((a, b) => (b.trendingScore ?? 0) - (a.trendingScore ?? 0));
    case 'FOLLOWING':
      return copy.sort(
        (a, b) =>
          Number(b.authorId === CURRENT_USER_ID) - Number(a.authorId === CURRENT_USER_ID) ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    default:
      return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
};

const seedFeed = (filter: FeedFilter, size: number): PageResponse<CommunityPost>[] =>
  paginate(sortSeedPosts(seedPosts, filter), size);

const seedCommunityPosts = (communityId: string, size: number): PageResponse<CommunityPost>[] =>
  paginate(
    sortSeedPosts(
      seedPosts.filter((post) => post.communityId === communityId),
      'LATEST',
    ),
    size,
  );

export const seedCategoriesForUse = (): CommunityCategory[] => seedCategories;

/* ============================================================
   Communities
   ============================================================ */

export const useCommunitiesQuery = (category?: string, tag?: string) => {
  const result = useQuery({
    queryKey: communityKeys.communities(category, tag),
    queryFn: async () => {
      const response = await communityService.getCommunities(0, 60, category, tag);
      return response.data.data.content;
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const fallback = useMemo(() => {
    let list = seedCommunities;
    if (category) list = list.filter((c) => c.category === category);
    if (tag) list = list.filter((c) => c.tags.includes(tag));
    return list;
  }, [category, tag]);

  return { ...result, communities: result.data ?? fallback, isOffline: result.isError };
};

export const useCommunityQuery = (communityId?: string) => {
  const result = useQuery({
    queryKey: communityKeys.community(communityId ?? 'none'),
    queryFn: async () => {
      const response = await communityService.getCommunity(communityId!);
      return response.data.data;
    },
    enabled: Boolean(communityId),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const community = result.data ?? seedCommunities.find((c) => c.id === communityId) ?? null;
  return { ...result, community, isOffline: result.isError };
};

export const useJoinCommunityMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (communityId: string) =>
      offline(
        communityService.joinCommunity(communityId).then((r) => r.data.data),
        () => seedCommunities.find((c) => c.id === communityId) ?? ({} as Community),
      ),
    onMutate: (communityId) => {
      updateCommunityInCaches(queryClient, communityId, (c) => ({
        ...c,
        joined: true,
        memberCount: c.memberCount + 1,
      }));
    },
    onSuccess: () => showSuccess('Joined community 🎉'),
    onError: (error) => showError(getErrorMessage(error)),
  });
};

export const useLeaveCommunityMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (communityId: string) =>
      offline(
        communityService.leaveCommunity(communityId).then((r) => r.data.data),
        () => seedCommunities.find((c) => c.id === communityId) ?? ({} as Community),
      ),
    onMutate: (communityId) => {
      updateCommunityInCaches(queryClient, communityId, (c) => ({
        ...c,
        joined: false,
        memberCount: Math.max(0, c.memberCount - 1),
      }));
    },
    onSuccess: () => showInfo('Left community'),
    onError: (error) => showError(getErrorMessage(error)),
  });
};

/* ============================================================
   Feed & posts
   ============================================================ */

export const useFeedQuery = (filter: FeedFilter = 'LATEST', pageSize = PAGE_SIZE) => {
  const result = useInfiniteQuery({
    queryKey: communityKeys.feed(filter, pageSize),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await communityService.getPosts(undefined, pageParam as number, pageSize);
      return response.data.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.page + 1),
    staleTime: 30 * 1000,
    retry: 1,
  });

  const fallbackPages = useMemo(() => seedFeed(filter, pageSize), [filter, pageSize]);
  const pages = result.data?.pages ?? fallbackPages;
  const posts = useMemo(() => pages.flatMap((page) => page.content), [pages]);
  const hasNextPage = result.hasNextPage ?? pages.length < fallbackPages.length;

  return { ...result, posts, pages, hasNextPage, isOffline: result.isError };
};

export const useCommunityPostsQuery = (communityId: string, pageSize = PAGE_SIZE) => {
  const result = useInfiniteQuery({
    queryKey: communityKeys.communityPosts(communityId, pageSize),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await communityService.getPosts(communityId, pageParam as number, pageSize);
      return response.data.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.page + 1),
    staleTime: 30 * 1000,
    retry: 1,
  });

  const fallbackPages = useMemo(() => seedCommunityPosts(communityId, pageSize), [communityId, pageSize]);
  const pages = result.data?.pages ?? fallbackPages;
  const posts = useMemo(() => pages.flatMap((page) => page.content), [pages]);
  const hasNextPage = result.hasNextPage ?? pages.length < fallbackPages.length;

  return { ...result, posts, pages, hasNextPage, isOffline: result.isError };
};

export const usePostQuery = (postId?: string) => {
  const result = useQuery({
    queryKey: communityKeys.post(postId ?? 'none'),
    queryFn: async () => {
      const response = await communityService.getPost(postId!);
      return response.data.data;
    },
    enabled: Boolean(postId),
    staleTime: 15 * 1000,
    refetchInterval: 20 * 1000,
    retry: 1,
  });

  const post = result.data ?? seedPosts.find((p) => p.id === postId) ?? null;
  return { ...result, post, isOffline: result.isError };
};

export const useTrendingPostsQuery = (limit = 6) => {
  const result = useQuery({
    queryKey: communityKeys.trending(limit),
    queryFn: async () => {
      const response = await communityService.getTrendingPosts(limit);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const fallback = useMemo(
    () => [...seedPosts].sort((a, b) => (b.trendingScore ?? 0) - (a.trendingScore ?? 0)).slice(0, limit),
    [limit],
  );

  return { ...result, posts: result.data ?? fallback, isOffline: result.isError };
};

export const usePinnedPostsQuery = (communityId?: string) => {
  const result = useQuery({
    queryKey: communityKeys.pinned(communityId),
    queryFn: async () => {
      const response = await communityService.getPinnedPosts(communityId);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const fallback = useMemo(
    () => seedPosts.filter((post) => post.pinned && (!communityId || post.communityId === communityId)),
    [communityId],
  );

  return { ...result, posts: result.data ?? fallback, isOffline: result.isError };
};

/* ---------------- Post mutations ---------------- */

/** Builds a fully-shaped post for optimistic creation. */
export const buildLocalPost = (payload: CreatePostRequest, community?: Community): CommunityPost => ({
  id: `post-${Date.now()}`,
  communityId: payload.communityId ?? community?.id,
  communityName: community?.name ?? seedCommunities.find((c) => c.id === payload.communityId)?.name,
  communitySlug: community?.slug ?? seedCommunities.find((c) => c.id === payload.communityId)?.slug,
  authorId: CURRENT_USER_ID,
  authorName: CURRENT_USER_NAME,
  authorTitle: 'Full-stack Engineer',
  authorIsMentor: false,
  content: payload.content,
  title: payload.title,
  contentType: payload.contentType,
  attachments: payload.attachments ?? [],
  poll: payload.poll
    ? {
        id: `poll-${Date.now()}`,
        question: payload.poll.question,
        options: payload.poll.options.map((text, index) => ({ id: `opt-${Date.now()}-${index}`, text, votes: 0 })),
        totalVotes: 0,
        votedOptionId: null,
      }
    : undefined,
  tags: payload.tags ?? [],
  mentions: payload.mentions ?? [],
  createdAt: new Date().toISOString(),
  likeCount: 0,
  commentCount: 0,
  bookmarkCount: 0,
  shareCount: 0,
  viewCount: 0,
  liked: false,
  bookmarked: false,
  following: false,
  pinned: false,
});

export const useCreatePostMutation = (communityId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePostRequest) =>
      offline(
        communityService.createPost(payload).then((r) => r.data.data),
        () => buildLocalPost(payload, seedCommunities.find((c) => c.id === communityId)),
      ),
    onSuccess: (post) => {
      // Offline-first: make the new post visible in seed fallback feeds too.
      seedPosts.unshift(post);
      queryClient.setQueriesData<unknown>({ queryKey: communityKeys.all }, (oldData: unknown) => {
        if (!oldData || typeof oldData !== 'object') return oldData;
        const asInfinite = oldData as { pages?: PageResponse<CommunityPost>[] };
        if (Array.isArray(asInfinite.pages)) {
          const first = asInfinite.pages[0];
          if (!first) return oldData;
          return {
            ...(oldData as object),
            pages: [
              {
                ...first,
                content: [post, ...first.content],
                totalElements: first.totalElements + 1,
                empty: false,
              },
              ...asInfinite.pages.slice(1),
            ],
          };
        }
        const asPage = oldData as PageResponse<CommunityPost>;
        if (Array.isArray(asPage.content) && 'totalElements' in asPage) {
          return { ...asPage, content: [post, ...asPage.content], totalElements: asPage.totalElements + 1, empty: false };
        }
        return oldData;
      });
      emitCommunityPost(post);
      showSuccess('Post published 🎉');
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};

export const useDeletePostMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) =>
      offline(communityService.deletePost(postId).then(() => undefined), () => undefined),
    onMutate: (postId) => {
      // Offline-first: remove the post from seed fallback feeds too.
      const seedIndex = seedPosts.findIndex((p) => p.id === postId);
      if (seedIndex >= 0) seedPosts.splice(seedIndex, 1);
      queryClient.setQueriesData<unknown>({ queryKey: communityKeys.all }, (oldData: unknown) => {
        if (!oldData || typeof oldData !== 'object') return oldData;
        const asInfinite = oldData as { pages?: PageResponse<CommunityPost>[] };
        if (Array.isArray(asInfinite.pages)) {
          return {
            ...(oldData as object),
            pages: asInfinite.pages.map((page) => ({
              ...page,
              content: page.content.filter((post) => post.id !== postId),
              totalElements: page.totalElements - 1,
            })),
          };
        }
        const asPage = oldData as PageResponse<CommunityPost>;
        if (Array.isArray(asPage.content) && 'totalElements' in asPage) {
          return { ...asPage, content: asPage.content.filter((post) => post.id !== postId), totalElements: asPage.totalElements - 1 };
        }
        if (Array.isArray(oldData)) return oldData.filter((item) => (item as CommunityPost).id !== postId);
        return oldData;
      });
    },
    onSuccess: () => showSuccess('Post deleted'),
    onError: (error) => showError(getErrorMessage(error)),
  });
};

export const useToggleLikeMutation = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (liked: boolean) =>
      offline(
        (liked
          ? communityService.likePost(postId)
          : communityService.unlikePost(postId)
        ).then((r) => r.data.data),
        () => getPostFromCaches(queryClient, postId) ?? ({} as CommunityPost),
      ),
    onMutate: (liked) => {
      updatePostInCaches(queryClient, postId, (post) => ({
        ...post,
        liked,
        likeCount: Math.max(0, post.likeCount + (liked ? 1 : -1)),
      }));
      emitCommunityLike(postId, liked);
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};

export const useToggleBookmarkMutation = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookmarked: boolean) =>
      offline(
        (bookmarked
          ? communityService.bookmarkPost(postId)
          : communityService.unbookmarkPost(postId)
        ).then((r) => r.data.data),
        () => getPostFromCaches(queryClient, postId) ?? ({} as CommunityPost),
      ),
    onMutate: (bookmarked) => {
      updatePostInCaches(queryClient, postId, (post) => ({
        ...post,
        bookmarked,
        bookmarkCount: Math.max(0, post.bookmarkCount + (bookmarked ? 1 : -1)),
      }));
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};

export const useSharePost = () => {
  const share = (post: CommunityPost) => {
    const url = `${window.location.origin}/community/posts/${post.id}`;
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(url).then(() => showSuccess('Link copied to clipboard'));
    } else {
      showInfo(url);
    }
  };
  return { share };
};

export const useReportMutation = () =>
  useMutation({
    mutationFn: (payload: { targetType: 'POST' | 'COMMENT' | 'REVIEW'; targetId: string; reason: string }) =>
      offline(communityService.report(payload).then(() => undefined), () => undefined),
    onSuccess: () => showSuccess('Report submitted — our moderators will review it'),
    onError: (error) => showError(getErrorMessage(error)),
  });

/* ============================================================
   Comments
   ============================================================ */

export const useCommentsQuery = (postId?: string) => {
  const result = useQuery({
    queryKey: communityKeys.comments(postId ?? 'none'),
    queryFn: async () => {
      const response = await communityService.getPostComments(postId!, 0, 100);
      return response.data.data.content;
    },
    enabled: Boolean(postId),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    retry: 1,
  });

  const fallback = useMemo(
    () => seedComments[postId ?? ''] ?? [],
    [postId],
  );

  return { ...result, comments: result.data ?? fallback, isOffline: result.isError };
};

export const useCreateCommentMutation = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCommentRequest) =>
      offline(
        communityService.createComment(payload).then((r) => r.data.data),
        (): CommunityComment => ({
          id: `comment-${Date.now()}`,
          postId,
          parentId: payload.parentId ?? null,
          authorId: CURRENT_USER_ID,
          authorName: CURRENT_USER_NAME,
          authorTitle: 'Full-stack Engineer',
          content: payload.content,
          mentions: payload.mentions ?? [],
          reactions: [],
          likeCount: 0,
          liked: false,
          replyCount: 0,
          createdAt: new Date().toISOString(),
        }),
      ),
    onSuccess: (comment) => {
      const seedList = seedComments[postId];
      const baseList = seedList ? [...seedList] : [];
      if (seedList) seedList.push(comment);
      else seedComments[postId] = [comment];
      // When the query errored (offline), seed the cache with the full fallback
      // list plus the new comment so the thread tree is never truncated.
      queryClient.setQueryData<CommunityComment[]>(communityKeys.comments(postId), (old) => [
        ...(old ?? baseList),
        comment,
      ]);
      updatePostInCaches(queryClient, postId, (post) => ({
        ...post,
        commentCount: post.commentCount + 1,
      }));
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};

export const useToggleCommentLikeMutation = (postId: string, commentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (liked: boolean) =>
      offline(
        (liked
          ? communityService.likeComment(commentId)
          : communityService.unlikeComment(commentId)
        ).then((r) => r.data.data),
        () => ({} as CommunityComment),
      ),
    onMutate: (liked) => {
      updateCommentInCache(queryClient, postId, commentId, (comment) => ({
        ...comment,
        liked,
        likeCount: Math.max(0, comment.likeCount + (liked ? 1 : -1)),
      }));
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};

export const useDeleteCommentMutation = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      offline(communityService.deleteComment(commentId).then(() => undefined), () => undefined),
    onMutate: (commentId) => {
      const seedList = seedComments[postId];
      if (seedList) {
        const seedIndex = seedList.findIndex((c) => c.id === commentId);
        if (seedIndex >= 0) seedList.splice(seedIndex, 1);
      }
      queryClient.setQueryData<CommunityComment[]>(communityKeys.comments(postId), (old) =>
        old?.filter((comment) => comment.id !== commentId) ?? old,
      );
      updatePostInCaches(queryClient, postId, (post) => ({
        ...post,
        commentCount: Math.max(0, post.commentCount - 1),
      }));
    },
    onSuccess: () => showInfo('Comment deleted'),
    onError: (error) => showError(getErrorMessage(error)),
  });
};

/* ============================================================
   Polls
   ============================================================ */

export const useVotePollMutation = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (optionIds: string[]) =>
      offline(
        communityService.votePoll({ pollId: postId, optionIds }).then((r) => r.data.data),
        () => null,
      ),
    onMutate: (optionIds) => {
      updatePostInCaches(queryClient, postId, (post) => {
        if (!post.poll) return post;
        const optionId = optionIds[0];
        const previousVote = post.poll.votedOptionId;
        const newOptions = post.poll.options.map((option) => {
          const voted = option.id === optionId;
          const wasVoted = option.id === previousVote;
          if (voted) return { ...option, votes: option.votes + 1 };
          if (wasVoted && optionId) return { ...option, votes: Math.max(0, option.votes - 1) };
          return option;
        });
        return {
          ...post,
          poll: {
            ...post.poll,
            options: newOptions,
            totalVotes: Math.max(0, post.poll.totalVotes + (previousVote ? 0 : 1)),
            votedOptionId: optionId,
          },
        };
      });
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};

/* ============================================================
   Leaderboard, activity, achievements, learning stats
   ============================================================ */

export const useLeaderboardQuery = (category: LeaderboardCategory, range: LeaderboardRange) => {
  const result = useQuery({
    queryKey: communityKeys.leaderboard(category, range),
    queryFn: async () => {
      const response = await communityService.getLeaderboard(category, range, 20);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const fallback = useMemo(
    () => seedLeaderboard[category]?.[range] ?? [],
    [category, range],
  );

  return { ...result, entries: (result.data ?? fallback) as LeaderboardEntry[], isOffline: result.isError };
};

export const useActivityQuery = (limit = 30) => {
  const result = useQuery({
    queryKey: communityKeys.activity(limit),
    queryFn: async () => {
      const response = await communityService.getActivity(limit);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const fallback = useMemo(() => seedActivity.slice(0, limit), [limit]);
  return { ...result, items: (result.data ?? fallback) as ActivityItem[], isOffline: result.isError };
};

export const useAchievementsQuery = () => {
  const result = useQuery({
    queryKey: communityKeys.achievements(),
    queryFn: async () => {
      const response = await communityService.getAchievements();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return { ...result, achievements: (result.data ?? seedAchievements) as Achievement[], isOffline: result.isError };
};

export const useLearningStatsQuery = () => {
  const result = useQuery({
    queryKey: communityKeys.learningStats(),
    queryFn: async () => {
      const response = await communityService.getLearningStats();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return { ...result, stats: (result.data ?? seedLearningStats) as LearningStats, isOffline: result.isError };
};

export const usePopularTagsQuery = () => {
  const result = useQuery({
    queryKey: communityKeys.popularTags(),
    queryFn: async () => {
      const response = await communityService.getPopularTags();
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  return { ...result, tags: (result.data ?? seedTags) as Tag[], isOffline: result.isError };
};

/* ============================================================
   Instant search (communities, posts, tags, users, reviews)
   ============================================================ */

export const useCommunitySearchQuery = (term: string) => {
  const debounced = useDebounce(term, 250);
  const result = useQuery({
    queryKey: communityKeys.search(debounced),
    queryFn: async () => {
      const response = await communityService.search(debounced);
      return response.data.data;
    },
    enabled: debounced.trim().length > 0,
    staleTime: 30 * 1000,
    retry: 1,
  });

  const fallback = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) {
      return {
        query: debounced,
        communities: [],
        posts: [],
        tags: [],
        users: [],
        reviews: [],
      };
    }
    const communities = seedCommunities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((tag) => tag.includes(q)),
    );
    const posts = seedPosts.filter(
      (p) =>
        p.content.toLowerCase().includes(q) ||
        (p.title ?? '').toLowerCase().includes(q) ||
        (p.tags ?? []).some((tag) => tag.includes(q)),
    );
    const tags = seedTags.filter((tag) => tag.name.includes(q)).map((tag) => ({ ...tag, count: Math.round(tag.count * 0.9) }));
    const rawUsers = [
      ...seedPosts.map((p) => ({ id: p.authorId, name: p.authorName, title: p.authorTitle, isMentor: p.authorIsMentor })),
      ...seedCommunities.flatMap((c) => c.moderators ?? []).map((m) => ({ id: m.userId, name: m.name, title: m.title, isMentor: true })),
    ].filter((u) => u.name.toLowerCase().includes(q));
    const seenIds = new Set<string>();
    const users = rawUsers.filter((u) => {
      if (seenIds.has(u.id)) return false;
      seenIds.add(u.id);
      return true;
    });
    const reviews = Object.entries(seedReviewsByMentor)
      .flatMap(([mentorId, list]) =>
        list
          .filter((r) => (r.content ?? '').toLowerCase().includes(q) || (r.title ?? '').toLowerCase().includes(q))
          .map((r) => ({
            id: r.id,
            mentorId,
            mentorName: seedCommunities.find((c) => c.id === mentorId)?.name ?? 'Mentor',
            learnerName: r.learnerName,
            rating: r.rating,
            content: r.content,
            createdAt: r.createdAt,
          })),
      )
      .slice(0, 5);
    return { query: debounced, communities: communities.slice(0, 6), posts: posts.slice(0, 8), tags: tags.slice(0, 8), users: users.slice(0, 6), reviews };
  }, [debounced]);

  return { ...result, results: result.data ?? fallback, isOffline: result.isError };
};

/* ============================================================
   Reviews & ratings (mentor review page)
   ============================================================ */

export const useMentorReviewsQuery = (
  mentorId?: string,
  rating?: number,
  sort: 'RECENT' | 'HELPFUL' | 'RATING' = 'RECENT',
) => {
  const result = useQuery({
    queryKey: ['reviews', 'mentor', mentorId ?? 'none', rating ?? 'all', sort],
    queryFn: async () => {
      const response = await reviewService.getReviewsByMentor(mentorId!, 0, 30, rating, sort);
      return response.data.data.content;
    },
    enabled: Boolean(mentorId),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const fallback = useMemo(() => {
    let list = seedReviewsByMentor[mentorId ?? ''] ?? [];
    if (rating) list = list.filter((review) => review.rating === rating);
    const copy = [...list];
    switch (sort) {
      case 'HELPFUL':
        copy.sort((a, b) => (b.helpfulCount ?? 0) - (a.helpfulCount ?? 0));
        break;
      case 'RATING':
        copy.sort((a, b) => b.rating - a.rating);
        break;
      default:
        copy.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
    }
    return copy;
  }, [mentorId, rating, sort]);

  return { ...result, reviews: (result.data ?? fallback) as Review[], isOffline: result.isError };
};

export const useMentorRatingSummaryQuery = (mentorId?: string) => {
  const result = useQuery({
    queryKey: ['reviews', 'summary', mentorId ?? 'none'],
    queryFn: async () => {
      const breakdown = await reviewService.getRatingBreakdown(mentorId!);
      const stats = await reviewService.getStatistics(mentorId!);
      return { breakdown: breakdown.data.data, stats: stats.data.data };
    },
    enabled: Boolean(mentorId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const fallback = useMemo<{ breakdown: RatingBreakdown; stats: { averageRating: number; totalReviews: number } }>(() => {
    const reviews = seedReviewsByMentor[mentorId ?? ''] ?? [];
    const total = reviews.length;
    const average = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
    const breakdown: Record<string, number> = {};
    for (let star = 1; star <= 5; star += 1) {
      breakdown[String(star)] = reviews.filter((r) => r.rating === star).length;
    }
    return {
      breakdown: {
        mentorId: mentorId ?? '',
        averageRating: Number(average.toFixed(1)),
        totalReviews: total,
        ratingBreakdown: breakdown,
        fiveStarPercentage: total ? (breakdown['5'] ?? 0) / total : 0,
        fourStarPercentage: total ? (breakdown['4'] ?? 0) / total : 0,
        threeStarPercentage: total ? (breakdown['3'] ?? 0) / total : 0,
        twoStarPercentage: total ? (breakdown['2'] ?? 0) / total : 0,
        oneStarPercentage: total ? (breakdown['1'] ?? 0) / total : 0,
      },
      stats: { averageRating: Number(average.toFixed(1)), totalReviews: total },
    };
  }, [mentorId]);

  const data = result.data ?? fallback;
  return { ...result, breakdown: data.breakdown, stats: data.stats, isOffline: result.isError };
};

export const useSubmitReviewMutation = (mentorId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReviewRequest & { anonymous?: boolean; dimensionRatings?: ReviewDimensionRatings }) =>
      offline(
        reviewService.createReview(payload).then((r) => r.data.data),
        (): Review => ({
          id: `review-${Date.now()}`,
          mentorId,
          learnerId: CURRENT_USER_ID,
          learnerName: payload.anonymous ? undefined : CURRENT_USER_NAME,
          rating: payload.rating,
          title: payload.title,
          content: payload.content,
          status: 'APPROVED',
          verified: true,
          anonymous: payload.anonymous,
          dimensionRatings: payload.dimensionRatings,
          helpfulCount: 0,
          notHelpfulCount: 0,
          replyCount: 0,
          createdAt: new Date().toISOString(),
        }),
      ),
    onSuccess: (review) => {
      // Offline-first: surface the new review in seed fallback lists too.
      const seedList = seedReviewsByMentor[mentorId];
      if (seedList) seedList.unshift(review);
      else seedReviewsByMentor[mentorId] = [review];
      void queryClient.invalidateQueries({ queryKey: ['reviews', 'mentor', mentorId] });
      void queryClient.invalidateQueries({ queryKey: ['reviews', 'summary', mentorId] });
      showSuccess('Review submitted — thank you! ⭐');
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};

export const useReviewVoteMutation = (mentorId: string, reviewId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (voteType: 'HELPFUL' | 'NOT_HELPFUL') =>
      offline(
        reviewService.voteReview({ reviewId, voteType }).then((r) => r.data.data),
        () => null,
      ),
    onMutate: (voteType) => {
      // Offline-first: reflect the vote in seed fallback lists too.
      const seedList = seedReviewsByMentor[mentorId];
      if (seedList) {
        const seedIndex = seedList.findIndex((r) => r.id === reviewId);
        if (seedIndex >= 0 && seedList[seedIndex]) {
          const review = seedList[seedIndex]!;
          const alreadyVoted = review.votedByMe;
          Object.assign(review, {
            helpfulCount: Math.max(0, (review.helpfulCount ?? 0) + (voteType === 'HELPFUL' ? (alreadyVoted ? -1 : 1) : 0)),
            notHelpfulCount: Math.max(0, (review.notHelpfulCount ?? 0) + (voteType === 'NOT_HELPFUL' ? (alreadyVoted ? -1 : 1) : 0)),
            votedByMe: !alreadyVoted,
            myVoteType: alreadyVoted ? undefined : voteType,
          });
        }
      }
      queryClient.setQueriesData<unknown>({ queryKey: ['reviews', 'mentor', mentorId] }, (oldData: unknown) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.map((item) => {
          const review = item as Review;
          if (review.id !== reviewId) return review;
          const alreadyVoted = review.votedByMe;
          const helpfulDelta = voteType === 'HELPFUL' ? (alreadyVoted ? -1 : 1) : 0;
          const notHelpfulDelta = voteType === 'NOT_HELPFUL' ? (alreadyVoted ? -1 : 1) : 0;
          return {
            ...review,
            helpfulCount: Math.max(0, (review.helpfulCount ?? 0) + helpfulDelta),
            notHelpfulCount: Math.max(0, (review.notHelpfulCount ?? 0) + notHelpfulDelta),
            votedByMe: !alreadyVoted,
            myVoteType: alreadyVoted ? undefined : voteType,
          };
        });
      });
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};

export const useReplyToReviewMutation = (mentorId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, content }: { reviewId: string; content: string }) =>
      offline(
        reviewService.replyToReview({ reviewId, content }).then((r) => r.data.data),
        () => null,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reviews', 'mentor', mentorId] });
      showSuccess('Reply posted');
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};

/* ============================================================
   Realtime + drafts
   ============================================================ */

/** Connects community socket events and, offline, streams lifelike activity. */
export const useCommunityLiveFeed = (): void => {
  const dispatch = useAppDispatch();
  const liveEvents = useAppSelector((state) => state.community.liveEvents);
  useEffect(() => {
    connectCommunitySocket(dispatch);
    const stopSimulation = simulateLiveFeed(dispatch);
    return () => stopSimulation();
  }, [dispatch]);
  void liveEvents;
};

export const useCommunityDraft = (key: string) => {
  const dispatch = useAppDispatch();
  const draft = useAppSelector(selectCommunityDraft(key));

  const save = (payload: Partial<CreatePostRequest>) => {
    dispatch(saveDraftAction({ key, payload }));
  };

  const clear = () => {
    dispatch(clearDraftAction(key));
  };

  return { draft, save, clear };
};
