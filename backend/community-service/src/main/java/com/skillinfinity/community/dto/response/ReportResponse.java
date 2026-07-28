package com.skillinfinity.community.dto.response;

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
@Schema(description = "Report response")
public class ReportResponse {

    @Schema(description = "Report ID")
    private UUID id;

    @Schema(description = "Reporter user ID")
    private UUID reporterId;

    @Schema(description = "Target type: POST, COMMENT")
    private String targetType;

    @Schema(description = "Target ID")
    private UUID targetId;

    @Schema(description = "Report reason")
    private String reason;

    @Schema(description = "Additional description")
    private String description;

    @Schema(description = "Report status: PENDING, REVIEWED, RESOLVED, DISMISSED")
    private String status;

    @Schema(description = "Moderator who reviewed")
    private UUID reviewedBy;

    @Schema(description = "Resolution notes")
    private String resolutionNotes;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last updated timestamp")
    private LocalDateTime updatedAt;
}
