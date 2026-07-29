package com.skillinfinity.admin.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Announcement request")
public class AnnouncementRequest {

    @NotBlank(message = "Title is required")
    @Schema(description = "Announcement title", example = "Platform Maintenance")
    private String title;

    @NotBlank(message = "Content is required")
    @Schema(description = "Announcement content", example = "The platform will undergo maintenance on...")
    private String content;

    @Schema(description = "Announcement type", example = "MAINTENANCE")
    private String announcementType;

    @Schema(description = "Target role", example = "ALL")
    private String targetRole;

    @Schema(description = "Priority", example = "HIGH")
    private String priority;

    @Schema(description = "Scheduled publish date")
    private LocalDateTime scheduledAt;

    @Schema(description = "Expiry date")
    private LocalDateTime expiresAt;
}
