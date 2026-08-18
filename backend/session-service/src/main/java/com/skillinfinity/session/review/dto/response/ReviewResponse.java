package com.skillinfinity.session.review.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Review response")
public class ReviewResponse {

    @Schema(description = "Review ID")
    private UUID id;

    @Schema(description = "Session ID")
    private UUID sessionId;

    @Schema(description = "Mentor ID")
    private UUID mentorId;

    @Schema(description = "Learner ID")
    private UUID learnerId;

    @Schema(description = "Rating (1-5)")
    private int rating;

    @Schema(description = "Review title")
    private String title;

    @Schema(description = "Review content")
    private String content;

    @Schema(description = "Review status: APPROVED")
    private String status;

    @Schema(description = "Published date")
    private LocalDateTime publishedAt;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last updated timestamp")
    private LocalDateTime updatedAt;
}
