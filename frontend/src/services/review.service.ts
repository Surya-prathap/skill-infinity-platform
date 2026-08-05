import { apiClient } from '@/api';
import { API_ENDPOINTS } from '@/constants';
import type {
  ApiResponse,
  PageResponse,
  RatingBreakdown,
  ReportRequest,
  Review,
  ReviewReplyRequest,
  ReviewRequest,
  ReviewStatistics,
  ReviewVoteRequest,
} from '@/types';

const resolve = (template: string, params: Record<string, string>): string =>
  Object.entries(params).reduce((url, [key, value]) => url.replace(`{${key}}`, value), template);

/**
 * review-service endpoints for mentor ratings, breakdowns and reviews,
 * including replies, helpful votes, reporting, search and moderation.
 */
export const reviewService = {
  getReviewsByMentor: (
    mentorId: string,
    page = 0,
    size = 20,
    rating?: number,
    sort: 'RECENT' | 'HELPFUL' | 'RATING' = 'RECENT',
  ) =>
    apiClient.get<ApiResponse<PageResponse<Review>>>(API_ENDPOINTS.REVIEWS.BASE, {
      params: { mentorId, page, size, rating, sort },
    }),

  getReview: (reviewId: string) =>
    apiClient.get<ApiResponse<Review>>(resolve(API_ENDPOINTS.REVIEWS.ITEM, { reviewId })),

  getRecentReviews: (mentorId: string, limit = 10) =>
    apiClient.get<ApiResponse<Review[]>>(API_ENDPOINTS.REVIEWS.RECENT, {
      params: { mentorId, limit },
    }),

  getStatistics: (mentorId: string) =>
    apiClient.get<ApiResponse<ReviewStatistics>>(API_ENDPOINTS.REVIEWS.STATISTICS, {
      params: { mentorId },
    }),

  getRatingBreakdown: (mentorId: string) =>
    apiClient.get<ApiResponse<RatingBreakdown>>(API_ENDPOINTS.REVIEWS.RATING_BREAKDOWN, {
      params: { mentorId },
    }),

  createReview: (payload: ReviewRequest) =>
    apiClient.post<ApiResponse<Review>>(API_ENDPOINTS.REVIEWS.BASE, payload),

  updateReview: (reviewId: string, payload: Partial<ReviewRequest>) =>
    apiClient.put<ApiResponse<Review>>(resolve(API_ENDPOINTS.REVIEWS.ITEM, { reviewId }), payload),

  deleteReview: (reviewId: string) =>
    apiClient.delete<ApiResponse<void>>(resolve(API_ENDPOINTS.REVIEWS.ITEM, { reviewId })),

  replyToReview: (payload: ReviewReplyRequest) =>
    apiClient.post<ApiResponse<Review>>(API_ENDPOINTS.REVIEWS.REPLY, payload),

  voteReview: (payload: ReviewVoteRequest) =>
    apiClient.post<ApiResponse<Review>>(API_ENDPOINTS.REVIEWS.VOTE, payload),

  reportReview: (payload: ReportRequest) =>
    apiClient.post<ApiResponse<void>>(API_ENDPOINTS.REVIEWS.REPORT, payload),

  searchReviews: (query: string, page = 0, size = 20) =>
    apiClient.get<ApiResponse<PageResponse<Review>>>(API_ENDPOINTS.REVIEWS.SEARCH, {
      params: { query, page, size },
    }),

  getTopRated: (limit = 10) =>
    apiClient.get<ApiResponse<Review[]>>(API_ENDPOINTS.REVIEWS.TOP_RATED, {
      params: { limit },
    }),

  getSessionReviews: (sessionId: string) =>
    apiClient.get<ApiResponse<Review[]>>(
      resolve(API_ENDPOINTS.REVIEWS.SESSION, { sessionId }),
    ),
};

export default reviewService;
