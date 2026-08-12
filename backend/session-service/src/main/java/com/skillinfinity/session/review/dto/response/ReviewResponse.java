package com.skillinfinity.session.review.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
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

    @Schema(description = "Review status: PENDING, APPROVED, REJECTED")
    private String status;

    @Schema(description = "Is verified purchase")
    private boolean verified;

    @Schema(description = "Helpful vote count")
    private int helpfulCount;

    @Schema(description = "Not helpful vote count")
    private int notHelpfulCount;

    @Schema(description = "Reply count")
    private int replyCount;

    @Schema(description = "Is liked by current user")
    private boolean votedByMe;

    @Schema(description = "My vote type if voted")
    private String myVoteType;

    @Schema(description = "Replies to this review")
    private List<ReplyResponse> replies;

    @Schema(description = "Published date")
    private LocalDateTime publishedAt;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last updated timestamp")
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Reply response")
    public static class ReplyResponse {

        @Schema(description = "Reply ID")
        private UUID id;

        @Schema(description = "Mentor ID")
        private UUID mentorId;

        @Schema(description = "Content")
        private String content;

        @Schema(description = "Creation timestamp")
        private LocalDateTime createdAt;

        @Schema(description = "Last updated timestamp")
        private LocalDateTime updatedAt;
    }
}
