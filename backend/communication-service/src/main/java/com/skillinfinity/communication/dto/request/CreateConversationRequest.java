package com.skillinfinity.communication.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to create a new conversation")
public class CreateConversationRequest {

    @NotBlank(message = "Conversation type is required")
    @Schema(description = "Type of conversation", example = "PRIVATE_CHAT")
    private String conversationType;

    @Schema(description = "Conversation name (for group chats)")
    private String name;

    @Schema(description = "Session ID (for session chats)")
    private UUID sessionId;

    @Schema(description = "Mentor ID (for mentor-learner chats)")
    private UUID mentorId;

    @Schema(description = "Learner ID (for mentor-learner chats)")
    private UUID learnerId;

    @NotNull(message = "At least one participant is required")
    @Schema(description = "Participant user IDs")
    private Set<UUID> participantIds;
}
