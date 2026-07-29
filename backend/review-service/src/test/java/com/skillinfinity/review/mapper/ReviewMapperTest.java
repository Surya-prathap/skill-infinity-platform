package com.skillinfinity.review.mapper;

import com.skillinfinity.common.enums.ReviewStatus;
import com.skillinfinity.review.dto.response.ReviewResponse;
import com.skillinfinity.review.entity.Review;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class ReviewMapperTest {

    private final ReviewMapper mapper = Mappers.getMapper(ReviewMapper.class);

    @Test
    void shouldMapReviewToResponse() {
        Review review = new Review();
        review.setId(UUID.randomUUID());
        review.setSessionId(UUID.randomUUID());
        review.setMentorId(UUID.randomUUID());
        review.setLearnerId(UUID.randomUUID());
        review.setRating(4);
        review.setTitle("Great session");
        review.setContent("Very helpful");
        review.setStatus(ReviewStatus.APPROVED);
        review.setActive(true);
        review.setHelpfulCount(5);
        review.setCreatedAt(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());

        ReviewResponse response = mapper.toReviewResponse(review);

        assertNotNull(response);
        assertEquals(review.getId(), response.getId());
        assertEquals(review.getSessionId(), response.getSessionId());
        assertEquals(review.getMentorId(), response.getMentorId());
        assertEquals(review.getLearnerId(), response.getLearnerId());
        assertEquals(review.getRating(), response.getRating());
        assertEquals(review.getTitle(), response.getTitle());
        assertEquals(review.getContent(), response.getContent());
        assertEquals("APPROVED", response.getStatus());
        assertEquals(5, response.getHelpfulCount());
    }
}
