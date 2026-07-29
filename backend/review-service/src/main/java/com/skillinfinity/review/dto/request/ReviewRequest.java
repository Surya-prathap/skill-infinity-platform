package com.skillinfinity.review.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
@Schema(description = "Review creation/update request")
public class ReviewRequest {

    @NotNull(message = "Session ID is required")
    @Schema(description = "Session ID", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID sessionId;

    @NotNull(message = "Mentor ID is required")
    @Schema(description = "Mentor ID", example = "550e8400-e29b-41d4-a716-446655440001")
    private UUID mentorId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must not exceed 5")
    @Schema(description = "Rating (1-5)", example = "4")
    private Integer rating;

    @Size(max = 200, message = "Title must not exceed 200 characters")
    @Schema(description = "Review title", example = "Excellent mentoring session")
    private String title;

    @Size(max = 5000, message = "Content must not exceed 5000 characters")
    @Schema(description = "Review content", example = "The mentor was very knowledgeable and helped me understand the concepts clearly.")
    private String content;
}
