package com.skillinfinity.review.service.impl;

import com.skillinfinity.common.enums.ReviewStatus;
import com.skillinfinity.review.dto.request.ReviewRequest;
import com.skillinfinity.review.dto.response.ReviewResponse;
import com.skillinfinity.review.entity.Review;
import com.skillinfinity.review.exception.DuplicateReviewException;
import com.skillinfinity.review.exception.InvalidRatingException;
import com.skillinfinity.review.exception.ReviewNotFoundException;
import com.skillinfinity.review.mapper.ReviewMapper;
import com.skillinfinity.review.repository.CompletedSessionRepository;
import com.skillinfinity.review.repository.MentorRatingRepository;
import com.skillinfinity.review.repository.RatingStatisticsRepository;
import com.skillinfinity.review.repository.ReviewHistoryRepository;
import com.skillinfinity.review.repository.ReviewReplyRepository;
import com.skillinfinity.review.repository.ReviewReportRepository;
import com.skillinfinity.review.repository.ReviewRepository;
import com.skillinfinity.review.repository.ReviewVoteRepository;
import com.skillinfinity.review.event.ReviewEventPublisher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceImplTest {

    @Mock
    private ReviewRepository reviewRepository;
    @Mock
    private ReviewReplyRepository replyRepository;
    @Mock
    private ReviewVoteRepository voteRepository;
    @Mock
    private ReviewReportRepository reportRepository;
    @Mock
    private MentorRatingRepository mentorRatingRepository;
    @Mock
    private RatingStatisticsRepository statisticsRepository;
    @Mock
    private ReviewHistoryRepository historyRepository;
    @Mock
    private CompletedSessionRepository completedSessionRepository;
    @Mock
    private ReviewMapper mapper;
    @Mock
    private ReviewEventPublisher eventPublisher;

    private ReviewServiceImpl reviewService;
    private UUID learnerId;
    private UUID mentorId;
    private UUID sessionId;
    private UUID reviewId;
    private ReviewRequest request;

    @BeforeEach
    void setUp() {
        reviewService = new ReviewServiceImpl(
                reviewRepository, replyRepository, voteRepository, reportRepository,
                mentorRatingRepository, statisticsRepository, historyRepository,
                completedSessionRepository, mapper, eventPublisher
        );

        learnerId = UUID.randomUUID();
        mentorId = UUID.randomUUID();
        sessionId = UUID.randomUUID();
        reviewId = UUID.randomUUID();

        request = ReviewRequest.builder()
                .sessionId(sessionId)
                .mentorId(mentorId)
                .rating(4)
                .title("Great session")
                .content("Very helpful mentor")
                .build();
    }

    private void mockSuccessfulSessionCheck() {
        when(completedSessionRepository.existsBySessionIdAndLearnerId(sessionId, learnerId))
                .thenReturn(true);
    }

    private void mockRatingAndStatisticsUpdates() {
        when(mentorRatingRepository.findByMentorId(any(UUID.class))).thenReturn(Optional.empty());
        when(statisticsRepository.findByMentorId(any(UUID.class))).thenReturn(Optional.empty());
        Page<Review> emptyPage = new PageImpl<>(Collections.emptyList());
        when(reviewRepository.findByMentorIdAndActiveTrueAndStatusOrderByCreatedAtDesc(
                any(UUID.class), any(ReviewStatus.class), any(Pageable.class)))
                .thenReturn(emptyPage);
    }

    @Test
    void shouldCreateReviewSuccessfully() {
        mockSuccessfulSessionCheck();
        when(reviewRepository.existsBySessionIdAndLearnerIdAndActiveTrue(sessionId, learnerId))
                .thenReturn(false);
        mockRatingAndStatisticsUpdates();
        when(reviewRepository.save(any(Review.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(mapper.toReviewResponse(any(Review.class))).thenReturn(new ReviewResponse());

        ReviewResponse response = reviewService.createReview(request, learnerId);

        assertNotNull(response);
        verify(reviewRepository).save(any(Review.class));
        verify(eventPublisher).publishReviewCreated(any(Review.class));
    }

    @Test
    void shouldThrowExceptionForUncompletedSession() {
        when(completedSessionRepository.existsBySessionIdAndLearnerId(sessionId, learnerId))
                .thenReturn(false);

        assertThrows(com.skillinfinity.common.exception.BadRequestException.class,
                () -> reviewService.createReview(request, learnerId));
        verify(reviewRepository, never()).save(any());
    }

    @Test
    void shouldThrowExceptionForDuplicateReview() {
        mockSuccessfulSessionCheck();
        when(reviewRepository.existsBySessionIdAndLearnerIdAndActiveTrue(sessionId, learnerId))
                .thenReturn(true);

        assertThrows(DuplicateReviewException.class,
                () -> reviewService.createReview(request, learnerId));
        verify(reviewRepository, never()).save(any());
    }

    @Test
    void shouldThrowExceptionForInvalidRating() {
        mockSuccessfulSessionCheck();
        request.setRating(6);

        assertThrows(InvalidRatingException.class,
                () -> reviewService.createReview(request, learnerId));
    }

    @Test
    void shouldThrowExceptionWhenReviewNotFound() {
        when(reviewRepository.findByIdAndActiveTrue(reviewId)).thenReturn(Optional.empty());

        assertThrows(ReviewNotFoundException.class,
                () -> reviewService.getReview(reviewId, learnerId));
    }

    @Test
    void shouldReturnReviewSuccessfully() {
        Review review = createSampleReview();
        when(reviewRepository.findByIdAndActiveTrue(reviewId)).thenReturn(Optional.of(review));
        when(mapper.toReviewResponse(review)).thenReturn(new ReviewResponse());

        ReviewResponse response = reviewService.getReview(reviewId, learnerId);

        assertNotNull(response);
        verify(mapper).toReviewResponse(review);
    }

    @Test
    void shouldDeleteReviewSuccessfully() {
        Review review = createSampleReview();
        review.setLearnerId(learnerId);
        when(reviewRepository.findByIdAndActiveTrue(reviewId)).thenReturn(Optional.of(review));
        when(reviewRepository.save(any(Review.class))).thenReturn(review);
        mockRatingAndStatisticsUpdates();

        reviewService.deleteReview(reviewId, learnerId);

        assertFalse(review.isActive());
        verify(reviewRepository).save(review);
    }

    private Review createSampleReview() {
        Review review = new Review();
        review.setId(reviewId);
        review.setSessionId(sessionId);
        review.setMentorId(mentorId);
        review.setLearnerId(learnerId);
        review.setRating(4);
        review.setTitle("Great session");
        review.setContent("Very helpful mentor");
        review.setStatus(ReviewStatus.APPROVED);
        review.setActive(true);
        review.setCreatedAt(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());
        review.setCreatedBy(learnerId.toString());
        review.setUpdatedBy(learnerId.toString());
        return review;
    }
}
