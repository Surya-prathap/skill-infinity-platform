import { apiClient } from '@/api';
import { API_ENDPOINTS } from '@/constants';
import type {
  ApiResponse,
  PageResponse,
  RatingBreakdown,
  Review,
  ReviewRequest,
  ReviewStatistics,
} from '@/types';

const resolve = (template: string, params: Record<string, string>): string =>
  Object.entries(params).reduce((url, [key, value]) => url.replace(`{${key}}`, value), template);

/**
 * review endpoints for mentor ratings and reviews (hosted by session-service).
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

  getSessionReviews: (sessionId: string) =>
    apiClient.get<ApiResponse<Review[]>>(
      resolve(API_ENDPOINTS.REVIEWS.SESSION, { sessionId }),
    ),
};

export default reviewService;
