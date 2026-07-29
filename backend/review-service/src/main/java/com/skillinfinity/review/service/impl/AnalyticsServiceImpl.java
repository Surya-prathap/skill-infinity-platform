package com.skillinfinity.review.service.impl;

import com.skillinfinity.common.enums.ReviewStatus;
import com.skillinfinity.review.dto.response.RatingResponse;
import com.skillinfinity.review.dto.response.ReviewResponse;
import com.skillinfinity.review.mapper.ReviewMapper;
import com.skillinfinity.review.repository.ReviewRepository;
import com.skillinfinity.review.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsServiceImpl implements AnalyticsService {

    private final ReviewRepository reviewRepository;
    private final ReviewMapper mapper;

    @Override
    @Cacheable(value = "reviewStatistics", key = "'mentor_' + #mentorId")
    public RatingResponse.RatingStatisticsResponse getMentorRatingStatistics(UUID mentorId) {
        Double avgRating = reviewRepository.findAverageRatingByMentorId(mentorId);
        long totalReviews = reviewRepository.countByMentorId(mentorId);
        List<Object[]> breakdown = reviewRepository.findRatingBreakdownByMentorId(mentorId);

        double average = avgRating != null ? Math.round(avgRating * 100.0) / 100.0 : 0.0;

        int totalHelpfulVotes = reviewRepository.findRecentReviewsByMentorId(
                        mentorId, PageRequest.of(0, Integer.MAX_VALUE))
                .stream()
                .mapToInt(com.skillinfinity.review.entity.Review::getHelpfulCount)
                .sum();

        int totalReplies = reviewRepository.findRecentReviewsByMentorId(
                        mentorId, PageRequest.of(0, Integer.MAX_VALUE))
                .stream()
                .mapToInt(com.skillinfinity.review.entity.Review::getReplyCount)
                .sum();

        double growthRate = getReviewGrowthRate(mentorId);
        double engagementScore = getEngagementScore(mentorId);

        return RatingResponse.RatingStatisticsResponse.builder()
                .mentorId(mentorId)
                .averageRating(average)
                .totalReviews((int) totalReviews)
                .totalHelpfulVotes(totalHelpfulVotes)
                .totalReplies(totalReplies)
                .reviewGrowthRate(growthRate)
                .engagementScore(engagementScore)
                .build();
    }

    @Override
    @Cacheable(value = "averageRatings", key = "'mentor_' + #mentorId")
    public RatingResponse getAverageRating(UUID mentorId) {
        Double avgRating = reviewRepository.findAverageRatingByMentorId(mentorId);
        long totalReviews = reviewRepository.countByMentorId(mentorId);

        double average = avgRating != null ? Math.round(avgRating * 100.0) / 100.0 : 0.0;

        return RatingResponse.builder()
                .mentorId(mentorId)
                .averageRating(average)
                .totalReviews((int) totalReviews)
                .build();
    }

    @Override
    @Cacheable(value = "ratingBreakdown", key = "'mentor_' + #mentorId")
    public RatingResponse getRatingBreakdown(UUID mentorId) {
        Double avgRating = reviewRepository.findAverageRatingByMentorId(mentorId);
        long totalReviews = reviewRepository.countByMentorId(mentorId);
        List<Object[]> breakdown = reviewRepository.findRatingBreakdownByMentorId(mentorId);

        java.util.Map<Integer, Long> ratingBreakdown = new java.util.HashMap<>();
        for (int i = 1; i <= 5; i++) ratingBreakdown.put(i, 0L);

        for (Object[] row : breakdown) {
            ratingBreakdown.put(((Number) row[0]).intValue(), (Long) row[1]);
        }

        java.util.Map<Integer, Double> percentageBreakdown = new java.util.HashMap<>();
        for (int i = 1; i <= 5; i++) {
            long count = ratingBreakdown.get(i);
            double percentage = totalReviews > 0
                    ? Math.round((double) count / totalReviews * 10000.0) / 100.0
                    : 0.0;
            percentageBreakdown.put(i, percentage);
        }

        double average = avgRating != null ? Math.round(avgRating * 100.0) / 100.0 : 0.0;

        return RatingResponse.builder()
                .mentorId(mentorId)
                .averageRating(average)
                .totalReviews((int) totalReviews)
                .ratingBreakdown(ratingBreakdown)
                .ratingPercentageBreakdown(percentageBreakdown)
                .fiveStarPercentage(percentageBreakdown.getOrDefault(5, 0.0))
                .fourStarPercentage(percentageBreakdown.getOrDefault(4, 0.0))
                .threeStarPercentage(percentageBreakdown.getOrDefault(3, 0.0))
                .twoStarPercentage(percentageBreakdown.getOrDefault(2, 0.0))
                .oneStarPercentage(percentageBreakdown.getOrDefault(1, 0.0))
                .build();
    }

    @Override
    public double getReviewGrowthRate(UUID mentorId) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minus(30, ChronoUnit.DAYS);
        long recentReviews = reviewRepository.countByActiveTrueAndStatusAndCreatedAtBetween(
                ReviewStatus.APPROVED, thirtyDaysAgo, LocalDateTime.now());
        long totalReviews = reviewRepository.countByMentorId(mentorId);

        return totalReviews > 0
                ? Math.round(((double) recentReviews / totalReviews) * 100.0) / 100.0
                : 0.0;
    }

    @Override
    public double getEngagementScore(UUID mentorId) {
        List<com.skillinfinity.review.entity.Review> reviews = reviewRepository
                .findRecentReviewsByMentorId(mentorId, PageRequest.of(0, Integer.MAX_VALUE));

        long totalReviews = reviews.size();
        long totalInteractions = reviews.stream()
                .mapToInt(r -> r.getReplyCount() + r.getHelpfulCount())
                .sum();

        return totalReviews > 0
                ? Math.round(((double) totalInteractions / totalReviews) * 100.0) / 100.0
                : 0.0;
    }

    @Override
    @Cacheable(value = "topMentors", key = "'limit_' + #limit")
    public List<RatingResponse.TopMentorResponse> getTopRatedMentors(int limit) {
        List<Object[]> results = reviewRepository.findTopRatedMentors(PageRequest.of(0, limit));
        return results.stream()
                .map(row -> RatingResponse.TopMentorResponse.builder()
                        .mentorId((UUID) row[0])
                        .averageRating(Math.round(((Double) row[1]) * 100.0) / 100.0)
                        .totalReviews((Long) row[2])
                        .build())
                .toList();
    }

    @Override
    @Cacheable(value = "recentReviews", key = "'mentor_' + #mentorId + '_limit_' + #limit")
    public List<ReviewResponse> getRecentReviews(UUID mentorId, int limit) {
        return reviewRepository.findRecentReviewsByMentorId(mentorId, PageRequest.of(0, limit))
                .stream()
                .map(mapper::toReviewResponse)
                .toList();
    }

    @Override
    public long getTotalReviews(UUID mentorId) {
        return reviewRepository.countByMentorId(mentorId);
    }

    @Override
    public long getTotalApprovedReviews() {
        return reviewRepository.countByActiveTrueAndStatusAndCreatedAtBetween(
                ReviewStatus.APPROVED, LocalDateTime.of(2000, 1, 1, 0, 0), LocalDateTime.now());
    }

    @Override
    public long getTotalPendingReviews() {
        return reviewRepository.countByStatusAndActiveTrue(ReviewStatus.PENDING);
    }

    @Override
    public long getTotalReportedReviews() {
        return reviewRepository.countReportedReviews();
    }
}
