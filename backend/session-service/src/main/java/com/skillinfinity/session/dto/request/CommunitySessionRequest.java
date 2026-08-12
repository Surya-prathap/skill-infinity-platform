package com.skillinfinity.session.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Request to create a free community mentoring session")
public class CommunitySessionRequest {

    @NotBlank(message = "Topic is required")
    @Schema(description = "Session topic", example = "Java Streams Crash Course")
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

    @Schema(description = "Max participants (0 = unlimited)", example = "20")
    private Integer maxParticipants;
}
