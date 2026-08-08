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
import { connectCommunitySocket, emitCommunityLike, emitCommunityPost } from '@/socket';
import { useDebounce } from '@/hooks';
import { communityKeys } from './queryKeys';
import type {
  Achievement,
  ActivityItem,
  Community,
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

const EMPTY_FEED_PAGE = (size: number): PageResponse<CommunityPost> => ({
  content: [],
  page: 0,
  size,
  totalElements: 0,
  totalPages: 1,
  first: true,
  last: true,
  empty: true,
});

const EMPTY_REVIEWS = (): Review[] => [];

const EMPTY_BREAKDOWN = (mentorId: string): RatingBreakdown => ({
  mentorId,
  averageRating: 0,
  totalReviews: 0,
  ratingBreakdown: {},
  fiveStarPercentage: 0,
  fourStarPercentage: 0,
  threeStarPercentage: 0,
  twoStarPercentage: 0,
  oneStarPercentage: 0,
});

/* ============================================================
   Cache helpers — single source of truth for post updates
   ============================================================ */

/** Applies `updater` to every cached shape that contains the post. */
const updatePostInCaches = (
  queryClient: QueryClient,
  postId: string,
  updater: (post: CommunityPost) => CommunityPost,
): void => {
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

/** Applies `updater` to every cached shape that contains the community. */
const updateCommunityInCaches = (
  queryClient: QueryClient,
  communityId: string,
  updater: (community: Community) => Community,
): void => {
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
  queryClient.setQueryData<CommunityComment[]>(communityKeys.comments(postId), (old) =>
    old?.map((comment) => (comment.id === commentId ? updater(comment) : comment)) ?? old,
  );
};

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

  return { ...result, communities: (result.data ?? []) as Community[], isOffline: result.isError };
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

  return { ...result, community: (result.data ?? null) as Community | null, isOffline: result.isError };
};

export const useJoinCommunityMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (communityId: string) =>
      communityService.joinCommunity(communityId).then((r) => r.data.data),
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
      communityService.leaveCommunity(communityId).then((r) => r.data.data),
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

  const pages = result.data?.pages ?? [EMPTY_FEED_PAGE(pageSize)];
  const posts = useMemo(() => pages.flatMap((page) => page.content), [pages]);
  const hasNextPage = result.hasNextPage ?? false;

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

  const pages = result.data?.pages ?? [EMPTY_FEED_PAGE(pageSize)];
  const posts = useMemo(() => pages.flatMap((page) => page.content), [pages]);
  const hasNextPage = result.hasNextPage ?? false;

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

  return { ...result, post: (result.data ?? null) as CommunityPost | null, isOffline: result.isError };
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

  return { ...result, posts: (result.data ?? []) as CommunityPost[], isOffline: result.isError };
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

  return { ...result, posts: (result.data ?? []) as CommunityPost[], isOffline: result.isError };
};

/* ---------------- Post mutations ---------------- */

/** Builds a fully-shaped post for optimistic creation. */
export const buildLocalPost = (
  payload: CreatePostRequest,
  community: Community | undefined,
  identity: { userId: string; userName: string },
): CommunityPost => ({
  id: `post-${Date.now()}`,
  communityId: payload.communityId ?? community?.id,
  communityName: community?.name,
  communitySlug: community?.slug,
  authorId: identity.userId,
  authorName: identity.userName,
  authorTitle: '',
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

export const useCreatePostMutation = (_communityId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePostRequest) =>
      communityService.createPost(payload).then((r) => r.data.data),
    onSuccess: (post) => {
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
    mutationFn: (postId: string) => communityService.deletePost(postId).then(() => undefined),
    onMutate: (postId) => {
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
      (liked
        ? communityService.likePost(postId)
        : communityService.unlikePost(postId)
      ).then((r) => r.data.data),
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
      (bookmarked
        ? communityService.bookmarkPost(postId)
        : communityService.unbookmarkPost(postId)
      ).then((r) => r.data.data),
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
      communityService.report(payload).then(() => undefined),
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

  return { ...result, comments: (result.data ?? []) as CommunityComment[], isOffline: result.isError };
};

export const useCreateCommentMutation = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCommentRequest) =>
      communityService.createComment(payload).then((r) => r.data.data),
    onSuccess: (comment) => {
      queryClient.setQueryData<CommunityComment[]>(communityKeys.comments(postId), (old) => [
        ...(old ?? []),
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
      (liked
        ? communityService.likeComment(commentId)
        : communityService.unlikeComment(commentId)
      ).then((r) => r.data.data),
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
    mutationFn: (commentId: string) => communityService.deleteComment(commentId).then(() => undefined),
    onMutate: (commentId) => {
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
      communityService.votePoll({ pollId: postId, optionIds }).then((r) => r.data.data),
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

  return { ...result, entries: (result.data ?? []) as LeaderboardEntry[], isOffline: result.isError };
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

  return { ...result, items: (result.data ?? []) as ActivityItem[], isOffline: result.isError };
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

  return { ...result, achievements: (result.data ?? []) as Achievement[], isOffline: result.isError };
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

  return { ...result, stats: (result.data ?? null) as LearningStats | null, isOffline: result.isError };
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

  return { ...result, tags: (result.data ?? []) as Tag[], isOffline: result.isError };
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

  const fallback = useMemo(
    () => ({
      query: debounced,
      communities: [],
      posts: [],
      tags: [],
      users: [],
      reviews: [],
    }),
    [debounced],
  );

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

  return { ...result, reviews: (result.data ?? EMPTY_REVIEWS()) as Review[], isOffline: result.isError };
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

  const fallback = useMemo(
    () => ({ breakdown: EMPTY_BREAKDOWN(mentorId ?? ''), stats: { averageRating: 0, totalReviews: 0 } }),
    [mentorId],
  );

  const data = result.data ?? fallback;
  return { ...result, breakdown: data.breakdown, stats: data.stats, isOffline: result.isError };
};

export const useSubmitReviewMutation = (mentorId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReviewRequest & { anonymous?: boolean; dimensionRatings?: ReviewDimensionRatings }) =>
      reviewService.createReview(payload).then((r) => r.data.data),
    onSuccess: () => {
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
      reviewService.voteReview({ reviewId, voteType }).then((r) => r.data.data),
    onMutate: (voteType) => {
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
      reviewService.replyToReview({ reviewId, content }).then((r) => r.data.data),
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

/** Connects community socket events into Redux. */
export const useCommunityLiveFeed = (): void => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    connectCommunitySocket(dispatch);
    return () => {
      // handlers are module-bound; disconnect happens on app-level cleanup
    };
  }, [dispatch]);
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
