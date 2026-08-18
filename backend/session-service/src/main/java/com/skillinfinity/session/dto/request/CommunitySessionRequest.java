package com.skillinfinity.session.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to create a community mentoring session (cost 0–3 credits, capacity 1–20 learners)")
public class CommunitySessionRequest {

    @NotBlank(message = "Topic is required")
    @Schema(description = "Session topic/title", example = "Java Resume Screening")
    private String topic;

    @Schema(description = "What learners will learn")
    private String description;

    @NotNull(message = "Start time is required")
    @Schema(description = "Session start time", example = "2026-08-25T18:00:00")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    @Schema(description = "Session end time", example = "2026-08-25T19:00:00")
    private LocalDateTime endTime;

    @Schema(description = "Timezone", example = "Asia/Kolkata")
    private String timezone;

    /**
     * Credit cost of the community session. 0 credits = TRUE FREE session
     * (counts toward the mentor's free-session benefits); 1–3 credits = paid
     * community session. The backend rejects anything above 3 credits.
     */
    @NotNull(message = "Cost in credits is required")
    @Min(value = 0, message = "Community session cost cannot be negative")
    @Max(value = 3, message = "Community session cost cannot exceed 3 credits")
    @Schema(description = "Cost in credits (0–3). 0 credits is a TRUE FREE session.", example = "0")
    private Integer cost;

    /**
     * Maximum number of learners who may join (1–20). The backend enforces
     * the 20-learner ceiling — a session at capacity rejects further joins.
     */
    @NotNull(message = "Maximum learners is required")
    @Min(value = 1, message = "Maximum learners must be at least 1")
    @Max(value = 20, message = "Maximum learners cannot exceed 20")
    @Schema(description = "Max learners (1–20)", example = "20")
    private Integer maxParticipants;
}
