package com.skillinfinity.review.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewUpdatedEvent {

    private UUID eventId;
    private UUID reviewId;
    private UUID sessionId;
    private UUID mentorId;
    private UUID learnerId;
    private int rating;
    private String title;
    private String content;
    private int previousRating;
    private String previousContent;
    private LocalDateTime timestamp;
    private String source;
}
