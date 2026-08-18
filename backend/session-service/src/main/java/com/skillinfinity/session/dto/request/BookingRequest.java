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
@Schema(description = "Request to book a session with a mentor")
public class BookingRequest {

    @NotNull(message = "Mentor ID is required")
    @Schema(description = "Mentor ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID mentorId;

    @NotNull(message = "Learner ID is required")
    @Schema(description = "Learner ID", example = "123e4567-e89b-12d3-a456-426614174001")
    private UUID learnerId;

    @Schema(description = "Mentor name", example = "John Doe")
    private String mentorName;

    @Schema(description = "Learner name", example = "Jane Smith")
    private String learnerName;

    @Schema(description = "Learner email — used for booking status notifications", example = "jane@example.com")
    private String learnerEmail;

    @NotBlank(message = "Topic is required")
    @Schema(description = "Session topic", example = "Advanced Java Concepts")
    private String topic;

    @Schema(description = "Description of what the learner wants to learn")
    private String description;

    @NotNull(message = "Preferred date is required")
    @Schema(description = "Preferred date and time for the session", example = "2026-08-20T14:00:00")
    private LocalDateTime preferredDate;

    @Schema(description = "Preferred start time", example = "2026-08-20T14:00:00")
    private LocalDateTime preferredStartTime;

    @Schema(description = "Preferred end time", example = "2026-08-20T15:00:00")
    private LocalDateTime preferredEndTime;

    @Positive(message = "Duration must be positive")
    @Schema(description = "Session duration in minutes", example = "60")
    private int durationMinutes;

    @Schema(description = "Selected mentor pricing plan (used by the backend to compute the cost server-side)")
    private UUID pricingId;

    @Schema(description = "Session cost in credits (1 credit = 10 minutes) — informational only, the backend recomputes it from the mentor's pricing", example = "6")
    private double credits;

    @Schema(description = "Timezone", example = "America/New_York")
    private String timezone;

    @Schema(description = "Message from the learner to the mentor")
    private String learnerMessage;
}
