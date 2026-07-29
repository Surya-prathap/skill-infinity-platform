package com.skillinfinity.review.service;

import com.skillinfinity.review.dto.request.ReplyRequest;
import com.skillinfinity.review.dto.request.ReportRequest;
import com.skillinfinity.review.dto.request.ReviewRequest;
import com.skillinfinity.review.dto.request.VoteRequest;
import com.skillinfinity.review.dto.response.RatingResponse;
import com.skillinfinity.review.dto.response.ReviewResponse;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.UUID;

public interface ReviewService {

    ReviewResponse createReview(ReviewRequest request, UUID learnerId);

    ReviewResponse updateReview(UUID reviewId, ReviewRequest request, UUID userId);

    void deleteReview(UUID reviewId, UUID userId);

    ReviewResponse getReview(UUID reviewId, UUID currentUserId);

    Page<ReviewResponse> getReviewsByMentor(UUID mentorId, int page, int size, UUID currentUserId);

    Page<ReviewResponse> getReviewsByLearner(UUID learnerId, int page, int size, UUID currentUserId);

    Page<ReviewResponse> getReviewsBySession(UUID sessionId, int page, int size, UUID currentUserId);

    Page<ReviewResponse> searchReviews(String query, int page, int size, UUID currentUserId);

    ReviewResponse replyToReview(ReplyRequest request, UUID mentorId);

    void voteReview(VoteRequest request, UUID userId);

    void reportReview(ReportRequest request, UUID userId);

    RatingResponse getAverageRating(UUID mentorId);

    RatingResponse getRatingBreakdown(UUID mentorId);

    List<ReviewResponse> getRecentReviews(UUID mentorId, int limit);

    List<RatingResponse.TopMentorResponse> getTopRatedMentors(int limit);

    Page<ReviewResponse> getSessionReviews(UUID sessionId, int page, int size, UUID currentUserId);

    RatingResponse.RatingStatisticsResponse getMentorRatingStatistics(UUID mentorId);

    void moderateReview(UUID reviewId, String status, String reason, UUID adminId);
}
