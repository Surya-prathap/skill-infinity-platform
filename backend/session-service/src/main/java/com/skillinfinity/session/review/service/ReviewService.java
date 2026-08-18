package com.skillinfinity.session.review.service;

import com.skillinfinity.session.review.dto.request.ReviewRequest;
import com.skillinfinity.session.review.dto.response.RatingResponse;
import com.skillinfinity.session.review.dto.response.ReviewResponse;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.UUID;

/**
 * Minimal rating flow: a learner who completed a session can write one review
 * (rating + comment). Reviews are approved on creation and listed on the
 * mentor's public profile.
 */
public interface ReviewService {

    ReviewResponse createReview(ReviewRequest request, UUID learnerId);

    ReviewResponse updateReview(UUID reviewId, ReviewRequest request, UUID userId);

    void deleteReview(UUID reviewId, UUID userId);

    ReviewResponse getReview(UUID reviewId);

    Page<ReviewResponse> getReviewsByMentor(UUID mentorId, int page, int size);

    Page<ReviewResponse> getSessionReviews(UUID sessionId, int page, int size);

    List<ReviewResponse> getRecentReviews(UUID mentorId, int limit);

    RatingResponse getAverageRating(UUID mentorId);

    RatingResponse getRatingBreakdown(UUID mentorId);

    RatingResponse.RatingStatisticsResponse getMentorRatingStatistics(UUID mentorId);
}
