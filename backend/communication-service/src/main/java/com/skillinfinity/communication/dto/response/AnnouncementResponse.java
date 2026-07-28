package com.skillinfinity.communication.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
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
@Schema(description = "Announcement response")
public class AnnouncementResponse {

    @Schema(description = "Announcement ID")
    private UUID id;

    @Schema(description = "Title")
    private String title;

    @Schema(description = "Content")
    private String content;

    @Schema(description = "Summary")
    private String summary;

    @Schema(description = "Status", example = "PUBLISHED")
    private String status;

    @Schema(description = "Target audience", example = "ALL_USERS")
    private String targetAudience;

    @Schema(description = "Is important")
    private boolean important;

    @Schema(description = "Scheduled at")
    private LocalDateTime scheduledAt;

    @Schema(description = "Published at")
    private LocalDateTime publishedAt;

    @Schema(description = "Created at")
    private LocalDateTime createdAt;

    @Schema(description = "Created by")
    private String createdBy;
}
