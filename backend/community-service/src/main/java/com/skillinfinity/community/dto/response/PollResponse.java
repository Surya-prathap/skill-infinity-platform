package com.skillinfinity.community.dto.response;

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
@Schema(description = "Poll response")
public class PollResponse {

    @Schema(description = "Poll ID")
    private UUID id;

    @Schema(description = "Post ID")
    private UUID postId;

    @Schema(description = "Poll question")
    private String question;

    @Schema(description = "Poll options with vote counts")
    private List<PollOptionResponse> options;

    @Schema(description = "Total votes")
    private int totalVotes;

    @Schema(description = "Allow multiple choice")
    private boolean multipleChoice;

    @Schema(description = "Has the poll expired")
    private boolean expired;

    @Schema(description = "Expiration date")
    private LocalDateTime expiresAt;

    @Schema(description = "Is voted by current user")
    private boolean votedByMe;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;
}
