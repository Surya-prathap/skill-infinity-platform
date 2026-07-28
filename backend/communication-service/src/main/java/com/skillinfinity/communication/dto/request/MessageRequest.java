package com.skillinfinity.communication.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Request to send a new message")
public class MessageRequest {

    @Schema(description = "Chat room ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID chatRoomId;

    @Schema(description = "Message content", example = "Hello, how are you?")
    @Size(max = 5000, message = "Message content must not exceed 5000 characters")
    private String content;

    @Schema(description = "Message type", example = "TEXT", defaultValue = "TEXT")
    private String messageType;

    @Schema(description = "Parent message ID for replies")
    private UUID replyToId;

    @Schema(description = "Forwarded message ID")
    private UUID forwardedFromId;

    @Schema(description = "Attachments")
    private List<AttachmentRequest> attachments;
}
