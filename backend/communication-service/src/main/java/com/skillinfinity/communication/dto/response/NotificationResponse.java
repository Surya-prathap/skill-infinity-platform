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
@Schema(description = "Notification response")
public class NotificationResponse {

    @Schema(description = "Notification ID")
    private UUID id;

    @Schema(description = "User ID")
    private UUID userId;

    @Schema(description = "Title")
    private String title;

    @Schema(description = "Body")
    private String body;

    @Schema(description = "Category", example = "MESSAGE")
    private String category;

    @Schema(description = "Channel", example = "IN_APP")
    private String channel;

    @Schema(description = "Reference ID")
    private String referenceId;

    @Schema(description = "Reference type")
    private String referenceType;

    @Schema(description = "Is read")
    private boolean read;

    @Schema(description = "Read at")
    private LocalDateTime readAt;

    @Schema(description = "Created at")
    private LocalDateTime createdAt;
}
