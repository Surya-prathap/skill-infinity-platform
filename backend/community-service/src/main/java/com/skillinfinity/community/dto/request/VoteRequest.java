package com.skillinfinity.community.dto.request;

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
@Schema(description = "Poll vote request")
public class VoteRequest {

    @NotNull(message = "Poll ID is required")
    @Schema(description = "Poll ID", required = true)
    private UUID pollId;

    @NotNull(message = "Option ID is required")
    @Schema(description = "Selected option ID", required = true)
    private UUID optionId;
}
