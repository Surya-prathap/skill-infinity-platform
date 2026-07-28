package com.skillinfinity.communication.dto.request;

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
@Schema(description = "Request to send a notification")
public class NotificationRequest {

    @NotNull(message = "User ID is required")
    @Schema(description = "Recipient user ID")
    private UUID userId;

    @NotBlank(message = "Title is required")
    @Schema(description = "Notification title", example = "New Message")
    private String title;

    @Schema(description = "Notification body", example = "You have a new message from John")
    private String body;

    @NotBlank(message = "Category is required")
    @Schema(description = "Notification category", example = "MESSAGE")
    private String category;

    @Schema(description = "Notification channel", example = "IN_APP")
    private String channel;

    @Schema(description = "Reference ID for related entity")
    private String referenceId;

    @Schema(description = "Reference type", example = "MESSAGE")
    private String referenceType;
}
