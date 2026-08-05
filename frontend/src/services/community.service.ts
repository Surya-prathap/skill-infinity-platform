import { apiClient } from '@/api';
import { API_ENDPOINTS } from '@/constants';
import type {
  ApiResponse,
  Achievement,
  ActivityItem,
  Community,
  CommunityPost,
  CommunityComment,
  CommunitySearchResult,
  CreateCommentRequest,
  CreatePostRequest,
  LeaderboardCategory,
  LeaderboardEntry,
  LeaderboardRange,
  LearningStats,
  PageResponse,
  Poll,
  PollVoteRequest,
  ReportRequest,
  Tag,
} from '@/types';

const resolve = (template: string, params: Record<string, string>): string =>
  Object.entries(params).reduce((url, [key, value]) => url.replace(`{${key}}`, value), template);

/**
 * community-service endpoints for communities, posts, comments, polls,
 * search, leaderboard, learning activity and achievements. The current user
 * is resolved from the JWT by the API gateway (X-User-ID header).
 */
export const communityService = {
  /* ---------------- Communities ---------------- */

  getCommunities: (page = 0, size = 30, category?: string, tag?: string) =>
    apiClient.get<ApiResponse<PageResponse<Community>>>(API_ENDPOINTS.COMMUNITY.COMMUNITIES, {
      params: { page, size, category, tag },
    }),

  getCommunity: (communityId: string) =>
    apiClient.get<ApiResponse<Community>>(
      resolve(API_ENDPOINTS.COMMUNITY.COMMUNITY_ITEM, { communityId }),
    ),

  getCommunityBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Community>>(
      resolve(API_ENDPOINTS.COMMUNITY.COMMUNITY_SLUG, { slug }),
    ),

  getMyCommunities: () =>
    apiClient.get<ApiResponse<Community[]>>(API_ENDPOINTS.COMMUNITY.COMMUNITY_MY),

  searchCommunities: (query: string, page = 0, size = 20) =>
    apiClient.get<ApiResponse<PageResponse<Community>>>(API_ENDPOINTS.COMMUNITY.COMMUNITY_SEARCH, {
      params: { query, page, size },
    }),

  joinCommunity: (communityId: string) =>
    apiClient.post<ApiResponse<Community>>(
      resolve(API_ENDPOINTS.COMMUNITY.COMMUNITY_JOIN, { communityId }),
    ),

  leaveCommunity: (communityId: string) =>
    apiClient.post<ApiResponse<Community>>(
      resolve(API_ENDPOINTS.COMMUNITY.COMMUNITY_LEAVE, { communityId }),
    ),

  /* ---------------- Posts ---------------- */

  getPosts: (communityId?: string, page = 0, size = 10) =>
    apiClient.get<ApiResponse<PageResponse<CommunityPost>>>(API_ENDPOINTS.COMMUNITY.POSTS, {
      params: { communityId, page, size },
    }),

  getPost: (postId: string) =>
    apiClient.get<ApiResponse<CommunityPost>>(
      resolve(API_ENDPOINTS.COMMUNITY.POST_ITEM, { postId }),
    ),

  createPost: (payload: CreatePostRequest) =>
    apiClient.post<ApiResponse<CommunityPost>>(API_ENDPOINTS.COMMUNITY.POSTS, payload),

  updatePost: (postId: string, payload: Partial<CreatePostRequest>) =>
    apiClient.put<ApiResponse<CommunityPost>>(
      resolve(API_ENDPOINTS.COMMUNITY.POST_ITEM, { postId }),
      payload,
    ),

  deletePost: (postId: string) =>
    apiClient.delete<ApiResponse<void>>(
      resolve(API_ENDPOINTS.COMMUNITY.POST_ITEM, { postId }),
    ),

  likePost: (postId: string) =>
    apiClient.post<ApiResponse<CommunityPost>>(
      resolve(API_ENDPOINTS.COMMUNITY.POST_LIKE, { postId }),
    ),

  unlikePost: (postId: string) =>
    apiClient.post<ApiResponse<CommunityPost>>(
      resolve(API_ENDPOINTS.COMMUNITY.POST_UNLIKE, { postId }),
    ),

  bookmarkPost: (postId: string) =>
    apiClient.post<ApiResponse<CommunityPost>>(
      resolve(API_ENDPOINTS.COMMUNITY.POST_BOOKMARK, { postId }),
    ),

  unbookmarkPost: (postId: string) =>
    apiClient.post<ApiResponse<CommunityPost>>(
      resolve(API_ENDPOINTS.COMMUNITY.POST_UNBOOKMARK, { postId }),
    ),

  getTrendingPosts: (limit = 10) =>
    apiClient.get<ApiResponse<CommunityPost[]>>(API_ENDPOINTS.COMMUNITY.POST_TRENDING, {
      params: { limit },
    }),

  getPinnedPosts: (communityId?: string) =>
    apiClient.get<ApiResponse<CommunityPost[]>>(API_ENDPOINTS.COMMUNITY.POST_PINNED, {
      params: { communityId },
    }),

  /* ---------------- Comments ---------------- */

  createComment: (payload: CreateCommentRequest) =>
    apiClient.post<ApiResponse<CommunityComment>>(API_ENDPOINTS.COMMUNITY.COMMENTS, payload),

  deleteComment: (commentId: string) =>
    apiClient.delete<ApiResponse<void>>(
      resolve(API_ENDPOINTS.COMMUNITY.COMMENT_ITEM, { commentId }),
    ),

  getPostComments: (postId: string, page = 0, size = 50) =>
    apiClient.get<ApiResponse<PageResponse<CommunityComment>>>(API_ENDPOINTS.COMMUNITY.COMMENTS, {
      params: { postId, page, size },
    }),

  getCommentReplies: (parentId: string) =>
    apiClient.get<ApiResponse<CommunityComment[]>>(
      resolve(API_ENDPOINTS.COMMUNITY.COMMENT_REPLIES, { parentId }),
    ),

  likeComment: (commentId: string) =>
    apiClient.post<ApiResponse<CommunityComment>>(
      resolve(API_ENDPOINTS.COMMUNITY.COMMENT_LIKE, { commentId }),
    ),

  unlikeComment: (commentId: string) =>
    apiClient.post<ApiResponse<CommunityComment>>(
      resolve(API_ENDPOINTS.COMMUNITY.COMMENT_UNLIKE, { commentId }),
    ),

  /* ---------------- Polls ---------------- */

  getPoll: (pollId: string) =>
    apiClient.get<ApiResponse<Poll>>(resolve(API_ENDPOINTS.COMMUNITY.POLL_ITEM, { pollId })),

  votePoll: (payload: PollVoteRequest) =>
    apiClient.post<ApiResponse<Poll>>(API_ENDPOINTS.COMMUNITY.POLL_VOTE, payload),

  /* ---------------- Search & reports ---------------- */

  search: (query: string) =>
    apiClient.get<ApiResponse<CommunitySearchResult>>(API_ENDPOINTS.COMMUNITY.SEARCH, {
      params: { query },
    }),

  report: (payload: ReportRequest) =>
    apiClient.post<ApiResponse<void>>(`${API_ENDPOINTS.COMMUNITY.BASE}/reports`, payload),

  /* ---------------- Leaderboard, activity, achievements ---------------- */

  getLeaderboard: (category: LeaderboardCategory, range: LeaderboardRange, limit = 20) =>
    apiClient.get<ApiResponse<LeaderboardEntry[]>>(API_ENDPOINTS.COMMUNITY.LEADERBOARD, {
      params: { category, range, limit },
    }),

  getActivity: (limit = 30) =>
    apiClient.get<ApiResponse<ActivityItem[]>>(API_ENDPOINTS.COMMUNITY.ACTIVITY, {
      params: { limit },
    }),

  getAchievements: () =>
    apiClient.get<ApiResponse<Achievement[]>>(API_ENDPOINTS.COMMUNITY.ACHIEVEMENTS),

  getLearningStats: () =>
    apiClient.get<ApiResponse<LearningStats>>(API_ENDPOINTS.COMMUNITY.LEARNING_STATS),

  getPopularTags: () =>
    apiClient.get<ApiResponse<Tag[]>>(API_ENDPOINTS.COMMUNITY.ANALYTICS_POPULAR_TAGS),
} as const;

export default communityService;
