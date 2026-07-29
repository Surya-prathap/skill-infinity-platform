package com.skillinfinity.review.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Review vote request")
public class VoteRequest {

    @NotNull(message = "Review ID is required")
    @Schema(description = "Review ID", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID reviewId;

    @NotBlank(message = "Vote type is required")
    @Schema(description = "Vote type: HELPFUL, NOT_HELPFUL", example = "HELPFUL")
    private String voteType;
}
