package com.skillinfinity.review.service;

import com.skillinfinity.review.dto.response.RatingResponse;
import com.skillinfinity.review.dto.response.ReviewResponse;

import java.util.List;
import java.util.UUID;

public interface AnalyticsService {

    RatingResponse.RatingStatisticsResponse getMentorRatingStatistics(UUID mentorId);

    RatingResponse getAverageRating(UUID mentorId);

    RatingResponse getRatingBreakdown(UUID mentorId);

    double getReviewGrowthRate(UUID mentorId);

    double getEngagementScore(UUID mentorId);

    List<RatingResponse.TopMentorResponse> getTopRatedMentors(int limit);

    List<ReviewResponse> getRecentReviews(UUID mentorId, int limit);

    long getTotalReviews(UUID mentorId);

    long getTotalApprovedReviews();

    long getTotalPendingReviews();

    long getTotalReportedReviews();
}
