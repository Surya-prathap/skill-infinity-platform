package com.skillinfinity.session.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.skillinfinity.session.enumeration.AttendanceStatus;
import io.swagger.v3.oas.annotations.media.Schema;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Attendance response")
public class AttendanceResponse {

    @Schema(description = "Attendance ID")
    private UUID id;

    @Schema(description = "Session ID")
    private UUID sessionId;

    @Schema(description = "User ID")
    private UUID userId;

    @Schema(description = "User name")
    private String userName;

    @Schema(description = "User role")
    private String role;

    @Schema(description = "Attendance status")
    private AttendanceStatus status;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Join time")
    private LocalDateTime joinTime;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Leave time")
    private LocalDateTime leaveTime;

    @Schema(description = "Duration in seconds")
    private Long durationSeconds;

    @Schema(description = "Whether the user was late")
    private boolean late;

    @Schema(description = "Minutes late")
    private Integer lateMinutes;

    @Schema(description = "Device info")
    private String deviceInfo;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Marked at")
    private LocalDateTime markedAt;
}
