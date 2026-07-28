package com.skillinfinity.community.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Search response")
public class SearchResponse {

    @Schema(description = "Matching posts")
    private List<PostResponse> posts;

    @Schema(description = "Matching communities")
    private List<CommunityResponse> communities;

    @Schema(description = "Total results count")
    private long totalResults;

    @Schema(description = "Current page")
    private int page;

    @Schema(description = "Page size")
    private int size;
}
