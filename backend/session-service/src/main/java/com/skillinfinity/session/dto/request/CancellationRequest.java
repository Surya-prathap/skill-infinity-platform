package com.skillinfinity.session.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Request to cancel a session")
public class CancellationRequest {

    @NotNull(message = "Session ID is required")
    @Schema(description = "Session ID", example = "123e4567-e89b-12d3-a456-426614174000")
    private UUID sessionId;

    @Schema(description = "Reason for cancellation", example = "Unforeseen personal circumstances")
    private String reason;

    @Schema(description = "Cancellation type", example = "VOLUNTARY", allowableValues = {"VOLUNTARY", "INVOLUNTARY", "NO_SHOW"})
    private String cancellationType;
}
