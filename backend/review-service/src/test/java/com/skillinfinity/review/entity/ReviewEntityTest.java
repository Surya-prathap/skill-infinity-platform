package com.skillinfinity.review.entity;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class ReviewEntityTest {

    @Test
    void shouldCreateReviewWithBuilder() {
        UUID learnerId = UUID.randomUUID();
        UUID mentorId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();

        Review review = Review.builder()
                .id(UUID.randomUUID())
                .sessionId(sessionId)
                .mentorId(mentorId)
                .learnerId(learnerId)
                .rating(4)
                .title("Great session")
                .content("Very helpful")
                .createdBy(learnerId.toString())
                .updatedBy(learnerId.toString())
                .build();

        assertNotNull(review);
        assertEquals(4, review.getRating());
        assertEquals("Great session", review.getTitle());
    }

    @Test
    void shouldCreateReviewReplyWithBuilder() {
        Review review = new Review();
        ReviewReply reply = ReviewReply.builder()
                .id(UUID.randomUUID())
                .review(review)
                .mentorId(UUID.randomUUID())
                .content("Thank you!")
                .createdBy("user")
                .updatedBy("user")
                .build();

        assertNotNull(reply);
        assertEquals("Thank you!", reply.getContent());
    }

    @Test
    void shouldCreateReviewVoteWithBuilder() {
        Review review = new Review();
        ReviewVote vote = ReviewVote.builder()
                .id(UUID.randomUUID())
                .review(review)
                .userId(UUID.randomUUID())
                .voteType(com.skillinfinity.review.enumeration.VoteType.HELPFUL)
                .build();

        assertNotNull(vote);
        assertEquals(com.skillinfinity.review.enumeration.VoteType.HELPFUL, vote.getVoteType());
    }

    @Test
    void shouldCreateReviewReportWithBuilder() {
        Review review = new Review();
        ReviewReport report = ReviewReport.builder()
                .id(UUID.randomUUID())
                .review(review)
                .reporterId(UUID.randomUUID())
                .reason(com.skillinfinity.review.enumeration.ReportReason.SPAM)
                .build();

        assertNotNull(report);
        assertEquals(com.skillinfinity.review.enumeration.ReportReason.SPAM, report.getReason());
    }

    @Test
    void shouldCreateMentorRatingWithBuilder() {
        MentorRating rating = MentorRating.builder()
                .id(UUID.randomUUID())
                .mentorId(UUID.randomUUID())
                .averageRating(4.5)
                .totalReviews(10)
                .build();

        assertNotNull(rating);
        assertEquals(4.5, rating.getAverageRating());
        assertEquals(10, rating.getTotalReviews());
    }
}
