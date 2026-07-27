package com.skillinfinity.session.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
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
@Schema(description = "Request to reschedule a session")
public class RescheduleRequestDto {

    @NotNull(message = "Session ID is required")
    @Schema(description = "Session ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID sessionId;

    @NotNull(message = "Proposed start time is required")
    @Schema(description = "Proposed new start time", example = "2026-08-22T10:00:00")
    private LocalDateTime proposedStartTime;

    @NotNull(message = "Proposed end time is required")
    @Schema(description = "Proposed new end time", example = "2026-08-22T11:00:00")
    private LocalDateTime proposedEndTime;

    @Schema(description = "Reason for rescheduling", example = "I have a conflict at the original time")
    private String reason;
}
