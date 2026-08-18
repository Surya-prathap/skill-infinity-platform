package com.skillinfinity.session.review.service.impl;

import com.skillinfinity.common.enums.ReviewStatus;
import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.common.exception.ForbiddenException;
import com.skillinfinity.session.review.dto.request.ReviewRequest;
import com.skillinfinity.session.review.dto.response.RatingResponse;
import com.skillinfinity.session.review.dto.response.ReviewResponse;
import com.skillinfinity.session.review.entity.RatingStatistics;
import com.skillinfinity.session.review.entity.Review;
import com.skillinfinity.session.review.exception.DuplicateReviewException;
import com.skillinfinity.session.review.exception.InvalidRatingException;
import com.skillinfinity.session.review.exception.ReviewNotFoundException;
import com.skillinfinity.session.review.mapper.ReviewMapper;
import com.skillinfinity.session.review.repository.CompletedSessionRepository;
import com.skillinfinity.session.review.repository.RatingStatisticsRepository;
import com.skillinfinity.session.review.repository.ReviewRepository;
import com.skillinfinity.session.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final RatingStatisticsRepository statisticsRepository;
    private final CompletedSessionRepository completedSessionRepository;
    private final ReviewMapper mapper;

    @Override
    public ReviewResponse createReview(ReviewRequest request, UUID learnerId) {
        log.info("Creating review for session: {} by learner: {}", request.getSessionId(), learnerId);

        // Only learners who actually completed the session may review it.
        if (!completedSessionRepository.existsBySessionIdAndLearnerId(
                request.getSessionId(), learnerId)) {
            throw new BadRequestException("You can only review sessions that you have completed");
        }

        // One review per (session, learner).
        if (reviewRepository.existsBySessionIdAndLearnerIdAndActiveTrue(
                request.getSessionId(), learnerId)) {
            throw new DuplicateReviewException("You have already submitted a review for this session");
        }

        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new InvalidRatingException("Rating must be between 1 and 5");
        }

        // Spam prevention: at most 5 reviews per hour per learner.
        LocalDateTime oneHourAgo = LocalDateTime.now().minus(1, ChronoUnit.HOURS);
        long recentReviews = reviewRepository.countByLearnerIdSince(learnerId, oneHourAgo);
        if (recentReviews >= 5) {
            throw new BadRequestException("You have exceeded the maximum number of reviews per hour. Please try again later.");
        }

        Review review = Review.builder()
                .sessionId(request.getSessionId())
                .mentorId(request.getMentorId())
                .learnerId(learnerId)
                .rating(request.getRating())
                .title(request.getTitle())
                .content(request.getContent())
                .status(ReviewStatus.APPROVED)
                .createdBy(learnerId.toString())
                .updatedBy(learnerId.toString())
                .build();

        review = reviewRepository.save(review);
        updateRatingStatistics(request.getMentorId());

        log.info("Review created successfully: {}", review.getId());
        return mapper.toReviewResponse(review);
    }

    @Override
    public ReviewResponse updateReview(UUID reviewId, ReviewRequest request, UUID userId) {
        Review review = reviewRepository.findByIdAndActiveTrue(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(reviewId.toString()));

        if (!review.getLearnerId().equals(userId)) {
            throw new ForbiddenException("You can only edit your own reviews");
        }

        if (request.getRating() != null) {
            if (request.getRating() < 1 || request.getRating() > 5) {
                throw new InvalidRatingException("Rating must be between 1 and 5");
            }
            review.setRating(request.getRating());
        }
        if (request.getTitle() != null) {
            review.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            review.setContent(request.getContent());
        }
        review.setUpdatedBy(userId.toString());

        review = reviewRepository.save(review);
        updateRatingStatistics(review.getMentorId());

        log.info("Review updated: {}", reviewId);
        return mapper.toReviewResponse(review);
    }

    @Override
    public void deleteReview(UUID reviewId, UUID userId) {
        Review review = reviewRepository.findByIdAndActiveTrue(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(reviewId.toString()));

        if (!review.getLearnerId().equals(userId)) {
            throw new ForbiddenException("You can only delete your own reviews");
        }

        review.setActive(false);
        review.setUpdatedBy(userId.toString());
        reviewRepository.save(review);
        updateRatingStatistics(review.getMentorId());

        log.info("Review deleted: {}", reviewId);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponse getReview(UUID reviewId) {
        Review review = reviewRepository.findByIdAndActiveTrue(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(reviewId.toString()));
        return mapper.toReviewResponse(review);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByMentor(UUID mentorId, int page, int size) {
        return reviewRepository.findByMentorIdAndActiveTrueAndStatusOrderByCreatedAtDesc(
                        mentorId, ReviewStatus.APPROVED, PageRequest.of(page, size))
                .map(mapper::toReviewResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getSessionReviews(UUID sessionId, int page, int size) {
        return reviewRepository.findBySessionIdAndActiveTrueOrderByCreatedAtDesc(
                        sessionId, PageRequest.of(page, size))
                .map(mapper::toReviewResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getRecentReviews(UUID mentorId, int limit) {
        return reviewRepository.findRecentReviewsByMentorId(mentorId, PageRequest.of(0, limit))
                .stream().map(mapper::toReviewResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
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
    @Transactional(readOnly = true)
    public RatingResponse getRatingBreakdown(UUID mentorId) {
        List<Object[]> breakdown = reviewRepository.findRatingBreakdownByMentorId(mentorId);
        long totalReviews = reviewRepository.countByMentorId(mentorId);

        Map<Integer, Long> ratingBreakdown = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            ratingBreakdown.put(i, 0L);
        }
        for (Object[] row : breakdown) {
            Integer rating = ((Number) row[0]).intValue();
            Long count = (Long) row[1];
            ratingBreakdown.put(rating, count);
        }

        Map<Integer, Double> percentageBreakdown = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            long count = ratingBreakdown.get(i);
            double percentage = totalReviews > 0
                    ? Math.round((double) count / totalReviews * 10000.0) / 100.0
                    : 0.0;
            percentageBreakdown.put(i, percentage);
        }

        return RatingResponse.builder()
                .mentorId(mentorId)
                .averageRating(getAverageRating(mentorId).getAverageRating())
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
    @Transactional(readOnly = true)
    public RatingResponse.RatingStatisticsResponse getMentorRatingStatistics(UUID mentorId) {
        RatingStatistics stats = statisticsRepository.findByMentorId(mentorId).orElse(null);
        if (stats != null) {
            return mapper.toStatisticsResponse(stats);
        }

        RatingResponse summary = getAverageRating(mentorId);
        return RatingResponse.RatingStatisticsResponse.builder()
                .mentorId(mentorId)
                .averageRating(summary.getAverageRating())
                .totalReviews(summary.getTotalReviews())
                .build();
    }

    /** Recomputes and stores the per-mentor rating aggregate after any change. */
    private void updateRatingStatistics(UUID mentorId) {
        Double avgRating = reviewRepository.findAverageRatingByMentorId(mentorId);
        long totalReviews = reviewRepository.countByMentorId(mentorId);
        List<Object[]> breakdown = reviewRepository.findRatingBreakdownByMentorId(mentorId);

        RatingStatistics stats = statisticsRepository.findByMentorId(mentorId)
                .orElse(RatingStatistics.builder()
                        .mentorId(mentorId)
                        .build());

        double average = avgRating != null ? Math.round(avgRating * 100.0) / 100.0 : 0.0;
        stats.setAverageRating(average);
        stats.setTotalReviews((int) totalReviews);

        Map<Integer, Integer> ratingCounts = new HashMap<>();
        for (int i = 1; i <= 5; i++) ratingCounts.put(i, 0);
        for (Object[] row : breakdown) {
            ratingCounts.put(((Number) row[0]).intValue(), ((Long) row[1]).intValue());
        }

        stats.setRating1Count(ratingCounts.get(1));
        stats.setRating2Count(ratingCounts.get(2));
        stats.setRating3Count(ratingCounts.get(3));
        stats.setRating4Count(ratingCounts.get(4));
        stats.setRating5Count(ratingCounts.get(5));

        statisticsRepository.save(stats);
    }
}
