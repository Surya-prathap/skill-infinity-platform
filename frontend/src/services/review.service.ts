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

/**
 * review-service endpoints for mentor ratings, breakdowns and reviews.
 */
export const reviewService = {
  getReviewsByMentor: (mentorId: string, page = 0, size = 20, rating?: number) =>
    apiClient.get<ApiResponse<PageResponse<Review>>>(API_ENDPOINTS.REVIEWS.BASE, {
      params: { mentorId, page, size, rating },
    }),

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
};

export default reviewService;
