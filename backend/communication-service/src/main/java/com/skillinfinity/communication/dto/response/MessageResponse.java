package com.skillinfinity.communication.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Message response")
public class MessageResponse {

    @Schema(description = "Message ID")
    private UUID id;

    @Schema(description = "Chat room ID")
    private UUID chatRoomId;

    @Schema(description = "Sender ID")
    private UUID senderId;

    @Schema(description = "Message type", example = "TEXT")
    private String messageType;

    @Schema(description = "Message content")
    private String content;

    @Schema(description = "Message status", example = "SENT")
    private String status;

    @Schema(description = "Reply to message ID")
    private UUID replyToId;

    @Schema(description = "Forwarded from message ID")
    private UUID forwardedFromId;

    @Schema(description = "Is message pinned")
    private boolean pinned;

    @Schema(description = "Attachments")
    private List<AttachmentResponse> attachments;

    @Schema(description = "Reactions")
    private List<ReactionResponse> reactions;

    @Schema(description = "Created at timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Edited at timestamp")
    private LocalDateTime editedAt;
}
