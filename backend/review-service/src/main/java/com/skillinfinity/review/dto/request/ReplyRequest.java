package com.skillinfinity.review.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Review reply request")
public class ReplyRequest {

    @NotNull(message = "Review ID is required")
    @Schema(description = "Review ID", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID reviewId;

    @NotBlank(message = "Content is required")
    @Size(max = 2000, message = "Content must not exceed 2000 characters")
    @Schema(description = "Reply content", example = "Thank you for your feedback! I'm glad you enjoyed the session.")
    private String content;
}
