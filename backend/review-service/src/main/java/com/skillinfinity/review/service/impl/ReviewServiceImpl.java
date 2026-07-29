package com.skillinfinity.review.service.impl;

import com.skillinfinity.common.enums.ReviewStatus;
import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.common.exception.ForbiddenException;
import com.skillinfinity.review.dto.request.ReplyRequest;
import com.skillinfinity.review.dto.request.ReportRequest;
import com.skillinfinity.review.dto.request.ReviewRequest;
import com.skillinfinity.review.dto.request.VoteRequest;
import com.skillinfinity.review.dto.response.RatingResponse;
import com.skillinfinity.review.dto.response.ReviewResponse;
import com.skillinfinity.review.entity.MentorRating;
import com.skillinfinity.review.entity.RatingStatistics;
import com.skillinfinity.review.entity.Review;
import com.skillinfinity.review.entity.ReviewHistory;
import com.skillinfinity.review.entity.ReviewReply;
import com.skillinfinity.review.entity.ReviewReport;
import com.skillinfinity.review.entity.ReviewVote;
import com.skillinfinity.review.enumeration.ReportReason;
import com.skillinfinity.review.enumeration.ReportStatus;
import com.skillinfinity.review.enumeration.VoteType;
import com.skillinfinity.review.event.ReviewEventPublisher;
import com.skillinfinity.review.exception.DuplicateReviewException;
import com.skillinfinity.review.exception.InvalidRatingException;
import com.skillinfinity.review.exception.ReviewNotFoundException;
import com.skillinfinity.review.mapper.ReviewMapper;
import com.skillinfinity.review.repository.MentorRatingRepository;
import com.skillinfinity.review.repository.RatingStatisticsRepository;
import com.skillinfinity.review.repository.ReviewHistoryRepository;
import com.skillinfinity.review.repository.ReviewReplyRepository;
import com.skillinfinity.review.repository.ReviewReportRepository;
import com.skillinfinity.review.repository.ReviewRepository;
import com.skillinfinity.review.repository.CompletedSessionRepository;
import com.skillinfinity.review.repository.ReviewVoteRepository;
import com.skillinfinity.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewReplyRepository replyRepository;
    private final ReviewVoteRepository voteRepository;
    private final ReviewReportRepository reportRepository;
    private final MentorRatingRepository mentorRatingRepository;
    private final RatingStatisticsRepository statisticsRepository;
    private final ReviewHistoryRepository historyRepository;
    private final CompletedSessionRepository completedSessionRepository;
    private final ReviewMapper mapper;
    private final ReviewEventPublisher eventPublisher;

    @Override
    @CacheEvict(value = {"topMentors", "averageRatings", "reviewStatistics", "recentReviews",
                         "ratingBreakdown", "sessionReviews"}, allEntries = true)
    public ReviewResponse createReview(ReviewRequest request, UUID learnerId) {
        log.info("Creating review for session: {} by learner: {}", request.getSessionId(), learnerId);

        // Verify session was completed before allowing review
        if (!completedSessionRepository.existsBySessionIdAndLearnerId(
                request.getSessionId(), learnerId)) {
            throw new BadRequestException(
                    "You can only review sessions that you have completed");
        }

        // Check for duplicate review
        if (reviewRepository.existsBySessionIdAndLearnerIdAndActiveTrue(
                request.getSessionId(), learnerId)) {
            throw new DuplicateReviewException(
                    "You have already submitted a review for this session");
        }

        // Validate rating range
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new InvalidRatingException("Rating must be between 1 and 5");
        }

        // Spam prevention: limit reviews per hour
        LocalDateTime oneHourAgo = LocalDateTime.now().minus(1, ChronoUnit.HOURS);
        long recentReviews = reviewRepository.countByLearnerIdSince(learnerId, oneHourAgo);
        if (recentReviews >= 5) {
            throw new BadRequestException(
                    "You have exceeded the maximum number of reviews per hour. Please try again later.");
        }

        Review review = Review.builder()
                .id(UUID.randomUUID())
                .sessionId(request.getSessionId())
                .mentorId(request.getMentorId())
                .learnerId(learnerId)
                .rating(request.getRating())
                .title(request.getTitle())
                .content(request.getContent())
                .status(ReviewStatus.PENDING)
                .createdBy(learnerId.toString())
                .updatedBy(learnerId.toString())
                .build();

        review = reviewRepository.save(review);

        updateMentorRating(request.getMentorId());
        updateRatingStatistics(request.getMentorId());

        saveHistory(review.getId(), learnerId, "CREATED", null,
                String.format("Rating: %d, Title: %s", request.getRating(), request.getTitle()));

        eventPublisher.publishReviewCreated(review);
        log.info("Review created successfully: {}", review.getId());

        return mapper.toReviewResponse(review);
    }

    @Override
    @CacheEvict(value = {"topMentors", "averageRatings", "reviewStatistics", "recentReviews",
                         "ratingBreakdown", "sessionReviews"}, allEntries = true)
    public ReviewResponse updateReview(UUID reviewId, ReviewRequest request, UUID userId) {
        Review review = reviewRepository.findByIdAndActiveTrue(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(reviewId.toString()));

        if (!review.getLearnerId().equals(userId)) {
            throw new ForbiddenException("You can only edit your own reviews");
        }

        String previousValue = String.format("Rating: %d, Content: %s", review.getRating(), review.getContent());

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
        review.setStatus(ReviewStatus.PENDING);

        review = reviewRepository.save(review);

        updateMentorRating(review.getMentorId());
        updateRatingStatistics(review.getMentorId());

        saveHistory(reviewId, userId, "UPDATED", previousValue,
                String.format("Rating: %d, Content: %s", review.getRating(), review.getContent()));

        eventPublisher.publishReviewUpdated(review);
        log.info("Review updated: {}", reviewId);

        return mapper.toReviewResponse(review);
    }

    @Override
    @CacheEvict(value = {"topMentors", "averageRatings", "reviewStatistics", "recentReviews",
                         "ratingBreakdown", "sessionReviews"}, allEntries = true)
    public void deleteReview(UUID reviewId, UUID userId) {
        Review review = reviewRepository.findByIdAndActiveTrue(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(reviewId.toString()));

        if (!review.getLearnerId().equals(userId)) {
            throw new ForbiddenException("You can only delete your own reviews");
        }

        review.setActive(false);
        review.setUpdatedBy(userId.toString());
        reviewRepository.save(review);

        updateMentorRating(review.getMentorId());
        updateRatingStatistics(review.getMentorId());

        saveHistory(reviewId, userId, "DELETED",
                String.format("Rating: %d, Content: %s", review.getRating(), review.getContent()), null);

        log.info("Review deleted: {}", reviewId);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponse getReview(UUID reviewId, UUID currentUserId) {
        Review review = reviewRepository.findByIdAndActiveTrue(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(reviewId.toString()));

        ReviewResponse response = mapper.toReviewResponse(review);
        populateUserVote(response, reviewId, currentUserId);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByMentor(UUID mentorId, int page, int size, UUID currentUserId) {
        Page<Review> reviews = reviewRepository.findByMentorIdAndActiveTrueAndStatusOrderByCreatedAtDesc(
                mentorId, ReviewStatus.APPROVED, PageRequest.of(page, size));
        return reviews.map(review -> {
            ReviewResponse response = mapper.toReviewResponse(review);
            populateUserVote(response, review.getId(), currentUserId);
            return response;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByLearner(UUID learnerId, int page, int size, UUID currentUserId) {
        Page<Review> reviews = reviewRepository.findByLearnerIdAndActiveTrueOrderByCreatedAtDesc(
                learnerId, PageRequest.of(page, size));
        return reviews.map(review -> {
            ReviewResponse response = mapper.toReviewResponse(review);
            populateUserVote(response, review.getId(), currentUserId);
            return response;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsBySession(UUID sessionId, int page, int size, UUID currentUserId) {
        Page<Review> reviews = reviewRepository.findBySessionIdAndActiveTrueOrderByCreatedAtDesc(
                sessionId, PageRequest.of(page, size));
        return reviews.map(review -> {
            ReviewResponse response = mapper.toReviewResponse(review);
            populateUserVote(response, review.getId(), currentUserId);
            return response;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> searchReviews(String query, int page, int size, UUID currentUserId) {
        Page<Review> reviews = reviewRepository.searchReviews(query, PageRequest.of(page, size));
        return reviews.map(review -> {
            ReviewResponse response = mapper.toReviewResponse(review);
            populateUserVote(response, review.getId(), currentUserId);
            return response;
        });
    }

    @Override
    @CacheEvict(value = {"recentReviews"}, allEntries = true)
    public ReviewResponse replyToReview(ReplyRequest request, UUID mentorId) {
        Review review = reviewRepository.findByIdAndActiveTrue(request.getReviewId())
                .orElseThrow(() -> new ReviewNotFoundException(request.getReviewId().toString()));

        if (!review.getMentorId().equals(mentorId)) {
            throw new ForbiddenException("Only the mentor being reviewed can reply");
        }

        if (replyRepository.existsByReviewIdAndMentorIdAndActiveTrue(request.getReviewId(), mentorId)) {
            throw new BadRequestException("You have already replied to this review");
        }

        ReviewReply reply = ReviewReply.builder()
                .id(UUID.randomUUID())
                .review(review)
                .mentorId(mentorId)
                .content(request.getContent())
                .createdBy(mentorId.toString())
                .updatedBy(mentorId.toString())
                .build();

        reply = replyRepository.save(reply);
        review.setReplyCount(review.getReplyCount() + 1);
        reviewRepository.save(review);

        log.info("Reply added to review: {} by mentor: {}", request.getReviewId(), mentorId);
        return mapper.toReviewResponse(review);
    }

    @Override
    @CacheEvict(value = {"reviewStatistics"}, allEntries = true)
    public void voteReview(VoteRequest request, UUID userId) {
        Review review = reviewRepository.findByIdAndActiveTrue(request.getReviewId())
                .orElseThrow(() -> new ReviewNotFoundException(request.getReviewId().toString()));

        VoteType voteType;
        try {
            voteType = VoteType.valueOf(request.getVoteType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid vote type: " + request.getVoteType());
        }

        if (voteRepository.existsByReviewIdAndUserIdAndActiveTrue(request.getReviewId(), userId)) {
            ReviewVote existingVote = voteRepository
                    .findByReviewIdAndUserIdAndActiveTrue(request.getReviewId(), userId)
                    .orElseThrow(() -> new BadRequestException("Vote not found"));

            if (existingVote.getVoteType() == voteType) {
                throw new BadRequestException("You have already voted this review as " + voteType);
            }

            // Change vote
            if (existingVote.getVoteType() == VoteType.HELPFUL) {
                review.setHelpfulCount(Math.max(0, review.getHelpfulCount() - 1));
                review.setNotHelpfulCount(review.getNotHelpfulCount() + 1);
            } else {
                review.setNotHelpfulCount(Math.max(0, review.getNotHelpfulCount() - 1));
                review.setHelpfulCount(review.getHelpfulCount() + 1);
            }

            existingVote.setVoteType(voteType);
            voteRepository.save(existingVote);
        } else {
            ReviewVote vote = ReviewVote.builder()
                    .id(UUID.randomUUID())
                    .review(review)
                    .userId(userId)
                    .voteType(voteType)
                    .build();

            voteRepository.save(vote);

            if (voteType == VoteType.HELPFUL) {
                review.setHelpfulCount(review.getHelpfulCount() + 1);
            } else {
                review.setNotHelpfulCount(review.getNotHelpfulCount() + 1);
            }
        }

        reviewRepository.save(review);
        log.debug("User {} voted review {} as {}", userId, request.getReviewId(), voteType);
    }

    @Override
    @CacheEvict(value = {"reviewStatistics"}, allEntries = true)
    public void reportReview(ReportRequest request, UUID userId) {
        Review review = reviewRepository.findByIdAndActiveTrue(request.getReviewId())
                .orElseThrow(() -> new ReviewNotFoundException(request.getReviewId().toString()));

        if (reportRepository.existsByReviewIdAndReporterIdAndActiveTrue(request.getReviewId(), userId)) {
            throw new BadRequestException("You have already reported this review");
        }

        ReportReason reason;
        try {
            reason = ReportReason.valueOf(request.getReason().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid report reason: " + request.getReason());
        }

        ReviewReport report = ReviewReport.builder()
                .id(UUID.randomUUID())
                .review(review)
                .reporterId(userId)
                .reason(reason)
                .description(request.getDescription())
                .build();

        reportRepository.save(report);

        review.setReportCount(review.getReportCount() + 1);
        reviewRepository.save(review);

        eventPublisher.publishReviewReported(review, reason.name());
        log.info("Review reported: {} by user: {}, reason: {}", request.getReviewId(), userId, reason);
    }

    @Override
    @Transactional(readOnly = true)
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
    @Transactional(readOnly = true)
    @Cacheable(value = "ratingBreakdown", key = "'mentor_' + #mentorId")
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
    @Cacheable(value = "recentReviews", key = "'mentor_' + #mentorId + '_limit_' + #limit")
    public List<ReviewResponse> getRecentReviews(UUID mentorId, int limit) {
        List<Review> reviews = reviewRepository.findRecentReviewsByMentorId(
                mentorId, PageRequest.of(0, limit));
        return reviews.stream().map(mapper::toReviewResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
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
    @Transactional(readOnly = true)
    @Cacheable(value = "sessionReviews", key = "'session_' + #sessionId")
    public Page<ReviewResponse> getSessionReviews(UUID sessionId, int page, int size, UUID currentUserId) {
        Page<Review> reviews = reviewRepository.findBySessionIdAndActiveTrueOrderByCreatedAtDesc(
                sessionId, PageRequest.of(page, size));
        return reviews.map(review -> {
            ReviewResponse response = mapper.toReviewResponse(review);
            populateUserVote(response, review.getId(), currentUserId);
            return response;
        });
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "reviewStatistics", key = "'mentor_' + #mentorId")
    public RatingResponse.RatingStatisticsResponse getMentorRatingStatistics(UUID mentorId) {
        RatingStatistics stats = statisticsRepository.findByMentorId(mentorId)
                .orElse(null);

        if (stats != null) {
            return mapper.toStatisticsResponse(stats);
        }

        // Calculate on the fly if not cached
        Double avgRating = reviewRepository.findAverageRatingByMentorId(mentorId);
        long totalReviews = reviewRepository.countByMentorId(mentorId);
        List<Object[]> breakdown = reviewRepository.findRatingBreakdownByMentorId(mentorId);
        long totalHelpfulVotes = reviewRepository.findRecentReviewsByMentorId(
                mentorId, PageRequest.of(0, Integer.MAX_VALUE))
                .stream()
                .mapToInt(Review::getHelpfulCount)
                .sum();

        double average = avgRating != null ? Math.round(avgRating * 100.0) / 100.0 : 0.0;

        return RatingResponse.RatingStatisticsResponse.builder()
                .mentorId(mentorId)
                .averageRating(average)
                .totalReviews((int) totalReviews)
                .totalHelpfulVotes((int) totalHelpfulVotes)
                .build();
    }

    @Override
    @CacheEvict(value = {"topMentors", "averageRatings", "reviewStatistics", "recentReviews",
                         "ratingBreakdown", "sessionReviews"}, allEntries = true)
    public void moderateReview(UUID reviewId, String status, String reason, UUID adminId) {
        Review review = reviewRepository.findByIdAndActiveTrue(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException(reviewId.toString()));

        ReviewStatus newStatus;
        try {
            newStatus = ReviewStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid review status: " + status);
        }

        String previousStatus = review.getStatus().name();
        review.setStatus(newStatus);
        review.setModerationReason(reason);
        review.setModeratedBy(adminId);
        review.setModeratedAt(LocalDateTime.now());
        review.setUpdatedBy(adminId.toString());

        if (newStatus == ReviewStatus.APPROVED && review.getPublishedAt() == null) {
            review.setPublishedAt(LocalDateTime.now());
        }

        reviewRepository.save(review);

        saveHistory(reviewId, adminId, "MODERATED",
                "Status: " + previousStatus,
                "Status: " + newStatus + ", Reason: " + reason);

        updateMentorRating(review.getMentorId());
        updateRatingStatistics(review.getMentorId());

        log.info("Review {} moderated to {} by admin {}", reviewId, newStatus, adminId);
    }

    private void updateMentorRating(UUID mentorId) {
        Double avgRating = reviewRepository.findAverageRatingByMentorId(mentorId);
        long totalReviews = reviewRepository.countByMentorId(mentorId);
        List<Object[]> breakdown = reviewRepository.findRatingBreakdownByMentorId(mentorId);

        MentorRating mentorRating = mentorRatingRepository.findByMentorId(mentorId)
                .orElse(MentorRating.builder()
                        .id(UUID.randomUUID())
                        .mentorId(mentorId)
                        .build());

        mentorRating.setAverageRating(avgRating != null ? Math.round(avgRating * 100.0) / 100.0 : 0.0);
        mentorRating.setTotalReviews((int) totalReviews);

        Map<Integer, Integer> ratingCounts = new HashMap<>();
        for (int i = 1; i <= 5; i++) ratingCounts.put(i, 0);
        for (Object[] row : breakdown) {
            ratingCounts.put(((Number) row[0]).intValue(), ((Long) row[1]).intValue());
        }

        mentorRating.setRating1Count(ratingCounts.get(1));
        mentorRating.setRating2Count(ratingCounts.get(2));
        mentorRating.setRating3Count(ratingCounts.get(3));
        mentorRating.setRating4Count(ratingCounts.get(4));
        mentorRating.setRating5Count(ratingCounts.get(5));

        mentorRatingRepository.save(mentorRating);
    }

    private void updateRatingStatistics(UUID mentorId) {
        Double avgRating = reviewRepository.findAverageRatingByMentorId(mentorId);
        long totalReviews = reviewRepository.countByMentorId(mentorId);
        List<Object[]> breakdown = reviewRepository.findRatingBreakdownByMentorId(mentorId);

        RatingStatistics stats = statisticsRepository.findByMentorId(mentorId)
                .orElse(RatingStatistics.builder()
                        .id(UUID.randomUUID())
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

        // Calculate median
        stats.setMedianRating(calculateMedianRating(ratingCounts, (int) totalReviews));

        // Count replies and helpful votes
        long totalReplies = reviewRepository.findByMentorIdAndActiveTrueAndStatusOrderByCreatedAtDesc(
                mentorId, ReviewStatus.APPROVED, PageRequest.of(0, Integer.MAX_VALUE))
                .stream()
                .mapToInt(Review::getReplyCount)
                .sum();
        stats.setTotalReplies((int) totalReplies);

        long totalHelpfulVotes = reviewRepository.findByMentorIdAndActiveTrueAndStatusOrderByCreatedAtDesc(
                mentorId, ReviewStatus.APPROVED, PageRequest.of(0, Integer.MAX_VALUE))
                .stream()
                .mapToInt(Review::getHelpfulCount)
                .sum();
        stats.setTotalHelpfulVotes((int) totalHelpfulVotes);

        // Calculate engagement score
        double engagementScore = totalReviews > 0
                ? Math.round(((double) (totalReplies + totalHelpfulVotes) / totalReviews) * 100.0) / 100.0
                : 0.0;
        stats.setEngagementScore(engagementScore);

        // Calculate review growth rate (reviews in last 30 days vs total)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minus(30, ChronoUnit.DAYS);
        long recentReviews = reviewRepository.countByActiveTrueAndStatusAndCreatedAtBetween(
                ReviewStatus.APPROVED, thirtyDaysAgo, LocalDateTime.now());
        double growthRate = totalReviews > 0
                ? Math.round(((double) recentReviews / totalReviews) * 100.0) / 100.0
                : 0.0;
        stats.setReviewGrowthRate(growthRate);

        statisticsRepository.save(stats);
    }

    private double calculateMedianRating(Map<Integer, Integer> ratingCounts, int total) {
        if (total == 0) return 0.0;

        int middle = total / 2;
        int cumulative = 0;

        for (int i = 1; i <= 5; i++) {
            cumulative += ratingCounts.get(i);
            if (cumulative > middle) {
                return i;
            }
        }
        return 0.0;
    }

    private void saveHistory(UUID reviewId, UUID changedBy, String action,
                             String previousValue, String newValue) {
        ReviewHistory history = ReviewHistory.builder()
                .id(UUID.randomUUID())
                .reviewId(reviewId)
                .action(action)
                .changedBy(changedBy)
                .previousValue(previousValue)
                .newValue(newValue)
                .build();
        historyRepository.save(history);
    }

    private void populateUserVote(ReviewResponse response, UUID reviewId, UUID userId) {
        if (userId != null) {
            voteRepository.findByReviewIdAndUserIdAndActiveTrue(reviewId, userId)
                    .ifPresent(vote -> {
                        response.setVotedByMe(true);
                        response.setMyVoteType(vote.getVoteType().name());
                    });
        }
    }
}
