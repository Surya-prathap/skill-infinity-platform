package com.skillinfinity.community.dto.response;

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
@Schema(description = "Poll option response")
public class PollOptionResponse {

    @Schema(description = "Option ID")
    private UUID id;

    @Schema(description = "Option text")
    private String text;

    @Schema(description = "Vote count")
    private int voteCount;

    @Schema(description = "Vote percentage")
    private double percentage;

    @Schema(description = "Sort order")
    private int sortOrder;
}
