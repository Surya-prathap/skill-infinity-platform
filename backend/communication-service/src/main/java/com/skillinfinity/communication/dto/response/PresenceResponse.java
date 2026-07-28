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
@Schema(description = "Presence response")
public class PresenceResponse {

    @Schema(description = "User ID")
    private UUID userId;

    @Schema(description = "Presence status", example = "ONLINE")
    private String status;

    @Schema(description = "Is user online")
    private boolean online;

    @Schema(description = "Last seen at")
    private LocalDateTime lastSeenAt;
}
