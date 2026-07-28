package com.skillinfinity.communication.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to create or update an announcement")
public class AnnouncementRequest {

    @NotBlank(message = "Title is required")
    @Schema(description = "Announcement title", example = "Platform Maintenance")
    private String title;

    @NotBlank(message = "Content is required")
    @Schema(description = "Announcement content", example = "The platform will be down for maintenance on Sunday.")
    private String content;

    @Schema(description = "Summary of the announcement", example = "Scheduled maintenance")
    private String summary;

    @Schema(description = "Announcement status", example = "DRAFT")
    private String status;

    @NotBlank(message = "Target audience is required")
    @Schema(description = "Target audience", example = "ALL_USERS")
    private String targetAudience;

    @Schema(description = "Specific user IDs for targeted announcements")
    private List<UUID> specificUserIds;

    @Schema(description = "Scheduled publish time")
    private LocalDateTime scheduledAt;

    @Schema(description = "Is this an important announcement?", example = "false")
    private boolean important;
}
