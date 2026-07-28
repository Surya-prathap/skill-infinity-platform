package com.skillinfinity.community.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Report content request")
public class ReportRequest {

    @NotBlank(message = "Target type is required")
    @Schema(description = "Target type: POST, COMMENT", example = "POST")
    private String targetType;

    @NotNull(message = "Target ID is required")
    @Schema(description = "ID of the reported content")
    private UUID targetId;

    @NotBlank(message = "Reason is required")
    @Schema(description = "Report reason: SPAM, HARASSMENT, INAPPROPRIATE_CONTENT, MISINFORMATION, COPYRIGHT_VIOLATION, HATE_SPEECH, OTHER", example = "SPAM")
    private String reason;

    @Schema(description = "Additional description")
    private String description;
}
