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
@Schema(description = "Participant response")
public class ParticipantResponse {

    @Schema(description = "User ID")
    private UUID userId;

    @Schema(description = "Role in conversation", example = "MEMBER")
    private String role;

    @Schema(description = "Is user admin")
    private boolean admin;

    @Schema(description = "Is user muted")
    private boolean muted;

    @Schema(description = "Last read timestamp")
    private LocalDateTime lastReadAt;

    @Schema(description = "Is user active")
    private boolean active;
}
