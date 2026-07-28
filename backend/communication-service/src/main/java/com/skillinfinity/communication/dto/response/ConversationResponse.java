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
@Schema(description = "Conversation response")
public class ConversationResponse {

    @Schema(description = "Chat room ID")
    private UUID id;

    @Schema(description = "Conversation name")
    private String name;

    @Schema(description = "Conversation type", example = "PRIVATE_CHAT")
    private String conversationType;

    @Schema(description = "Session ID")
    private UUID sessionId;

    @Schema(description = "Last message preview")
    private String lastMessageText;

    @Schema(description = "Last message timestamp")
    private LocalDateTime lastMessageAt;

    @Schema(description = "Last message sender ID")
    private UUID lastMessageBy;

    @Schema(description = "Participant count")
    private int participantCount;

    @Schema(description = "Is conversation pinned")
    private boolean pinned;

    @Schema(description = "Unread message count")
    private long unreadCount;

    @Schema(description = "Participants")
    private List<ParticipantResponse> participants;

    @Schema(description = "Created at")
    private LocalDateTime createdAt;
}
