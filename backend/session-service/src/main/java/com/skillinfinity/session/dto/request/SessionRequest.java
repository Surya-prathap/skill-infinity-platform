package com.skillinfinity.session.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
@Schema(description = "Request to create a new session")
public class SessionRequest {

    @NotBlank(message = "Title is required")
    @Schema(description = "Session title", example = "Introduction to Java Spring Boot")
    private String title;

    @Schema(description = "Session description", example = "A comprehensive session covering Spring Boot fundamentals")
    private String description;

    @NotNull(message = "Mentor ID is required")
    @Schema(description = "Mentor ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID mentorId;

    @NotNull(message = "Learner ID is required")
    @Schema(description = "Learner ID", example = "123e4567-e89b-12d3-a456-426614174001")
    private UUID learnerId;

    @Schema(description = "Mentor display name", example = "John Doe")
    private String mentorName;

    @Schema(description = "Learner display name", example = "Jane Smith")
    private String learnerName;

    @NotNull(message = "Start time is required")
    @Schema(description = "Session start time", example = "2026-08-15T10:00:00")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    @Schema(description = "Session end time", example = "2026-08-15T11:00:00")
    private LocalDateTime endTime;

    @Positive(message = "Duration must be positive")
    @Schema(description = "Duration in minutes", example = "60")
    private int durationMinutes;

    @Schema(description = "Timezone", example = "America/New_York")
    private String timezone;

    @Schema(description = "Session topic", example = "Java Programming")
    private String topic;

    @Schema(description = "Category", example = "Technology")
    private String category;

    @Schema(description = "Price", example = "99.99")
    private double price;

    @Schema(description = "Currency", example = "USD")
    private String currency;

    @Schema(description = "Whether the session is free", example = "false")
    private boolean free;
}
