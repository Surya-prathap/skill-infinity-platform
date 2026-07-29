package com.skillinfinity.review.repository;

import com.skillinfinity.common.enums.ReviewStatus;
import com.skillinfinity.review.entity.Review;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
class ReviewRepositoryTest {

    @Autowired
    private ReviewRepository reviewRepository;

    @Test
    void shouldSaveAndFindReview() {
        Review review = createSampleReview();
        review = reviewRepository.save(review);

        Optional<Review> found = reviewRepository.findByIdAndActiveTrue(review.getId());
        assertTrue(found.isPresent());
        assertEquals(4, found.get().getRating());
        assertTrue(found.get().isActive());
    }

    @Test
    void shouldCheckDuplicateReview() {
        UUID sessionId = UUID.randomUUID();
        UUID learnerId = UUID.randomUUID();

        Review review = createSampleReviewWith(sessionId, learnerId);
        reviewRepository.save(review);

        boolean exists = reviewRepository.existsBySessionIdAndLearnerIdAndActiveTrue(sessionId, learnerId);
        assertTrue(exists);
    }

    @Test
    void shouldFindReviewsByMentor() {
        UUID mentorId = UUID.randomUUID();
        Review review = createSampleReviewWith(UUID.randomUUID(), UUID.randomUUID());
        review.setMentorId(mentorId);
        reviewRepository.save(review);

        var reviews = reviewRepository.findByMentorIdAndActiveTrueAndStatusOrderByCreatedAtDesc(
                mentorId, ReviewStatus.APPROVED,
                org.springframework.data.domain.PageRequest.of(0, 10));

        assertTrue(reviews.hasContent());
    }

    @Test
    void shouldFindAverageRating() {
        UUID mentorId = UUID.randomUUID();
        UUID learnerId = UUID.randomUUID();

        Review review1 = createSampleReviewWith(UUID.randomUUID(), learnerId);
        review1.setMentorId(mentorId);
        review1.setRating(4);
        review1.setStatus(ReviewStatus.APPROVED);
        reviewRepository.save(review1);

        Double avg = reviewRepository.findAverageRatingByMentorId(mentorId);
        assertNotNull(avg);
        assertEquals(4.0, avg, 0.01);
    }

    private Review createSampleReview() {
        return createSampleReviewWith(UUID.randomUUID(), UUID.randomUUID());
    }

    private Review createSampleReviewWith(UUID sessionId, UUID learnerId) {
        Review review = new Review();
        review.setId(UUID.randomUUID());
        review.setSessionId(sessionId);
        review.setMentorId(UUID.randomUUID());
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
