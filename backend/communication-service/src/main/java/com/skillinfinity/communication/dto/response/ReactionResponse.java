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
@Schema(description = "Reaction response")
public class ReactionResponse {

    @Schema(description = "Reaction ID")
    private UUID id;

    @Schema(description = "User ID")
    private UUID userId;

    @Schema(description = "Emoji")
    private String emoji;
}
