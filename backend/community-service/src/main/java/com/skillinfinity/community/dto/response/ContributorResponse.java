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
@Schema(description = "Top contributor")
public class ContributorResponse {

    @Schema(description = "User ID")
    private UUID userId;

    @Schema(description = "Post count")
    private long postCount;

    @Schema(description = "Like count")
    private long likeCount;

    @Schema(description = "Comment count")
    private long commentCount;
}
