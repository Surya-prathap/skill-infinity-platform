package com.skillinfinity.review.event;

import com.skillinfinity.review.entity.Review;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReviewEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishReviewCreated(Review review) {
        ReviewCreatedEvent event = ReviewCreatedEvent.builder()
                .eventId(UUID.randomUUID())
                .reviewId(review.getId())
                .sessionId(review.getSessionId())
                .mentorId(review.getMentorId())
                .learnerId(review.getLearnerId())
                .rating(review.getRating())
                .title(review.getTitle())
                .content(review.getContent())
                .timestamp(LocalDateTime.now())
                .source("review-service")
                .build();

        log.info("Publishing review created event: {}", event.getEventId());
        rabbitTemplate.convertAndSend("review.exchange", "review.created", event);
    }

    public void publishReviewUpdated(Review review) {
        ReviewUpdatedEvent event = ReviewUpdatedEvent.builder()
                .eventId(UUID.randomUUID())
                .reviewId(review.getId())
                .sessionId(review.getSessionId())
                .mentorId(review.getMentorId())
                .learnerId(review.getLearnerId())
                .rating(review.getRating())
                .title(review.getTitle())
                .content(review.getContent())
                .timestamp(LocalDateTime.now())
                .source("review-service")
                .build();

        log.info("Publishing review updated event: {}", event.getEventId());
        rabbitTemplate.convertAndSend("review.exchange", "review.updated", event);
    }

    public void publishReviewDeleted(Review review) {
        log.info("Publishing review deleted event: reviewId={}", review.getId());
        rabbitTemplate.convertAndSend("review.exchange", "review.deleted", review.getId().toString());
    }

    public void publishReviewReported(Review review, String reason) {
        log.info("Publishing review reported event: reviewId={}, reason={}", review.getId(), reason);
        rabbitTemplate.convertAndSend("review.exchange", "review.reported", java.util.Map.of(
                "reviewId", review.getId().toString(),
                "mentorId", review.getMentorId().toString(),
                "learnerId", review.getLearnerId().toString(),
                "reason", reason,
                "timestamp", LocalDateTime.now().toString()
        ));
    }
}
