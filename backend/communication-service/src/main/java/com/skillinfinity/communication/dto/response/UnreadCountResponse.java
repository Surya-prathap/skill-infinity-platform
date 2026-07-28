package com.skillinfinity.communication.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Unread count response")
public class UnreadCountResponse {

    @Schema(description = "Chat room ID")
    private UUID chatRoomId;

    @Schema(description = "Unread message count")
    private long unreadCount;
}
