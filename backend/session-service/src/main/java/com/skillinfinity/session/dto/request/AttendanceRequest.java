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
@Schema(description = "Request to mark attendance for a session")
public class AttendanceRequest {

    @NotNull(message = "Session ID is required")
    @Schema(description = "Session ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID sessionId;

    @NotNull(message = "User ID is required")
    @Schema(description = "User ID", example = "123e4567-e89b-12d3-a456-426614174001")
    private UUID userId;

    @Schema(description = "Attendance status", example = "PRESENT", allowableValues = {"PRESENT", "ABSENT", "LATE", "LEFT_EARLY", "NO_SHOW"})
    private String attendanceStatus;

    @Schema(description = "Join time", example = "2026-08-15T10:05:00")
    private LocalDateTime joinTime;

    @Schema(description = "Leave time", example = "2026-08-15T11:00:00")
    private LocalDateTime leaveTime;

    @Schema(description = "Whether the user was late", example = "false")
    private boolean late;

    @Schema(description = "Minutes late", example = "5")
    private Integer lateMinutes;

    @Schema(description = "Device info", example = "Chrome on Windows")
    private String deviceInfo;
}
