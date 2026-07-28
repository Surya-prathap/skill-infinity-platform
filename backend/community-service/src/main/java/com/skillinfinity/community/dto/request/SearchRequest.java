package com.skillinfinity.community.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Search request parameters")
public class SearchRequest {

    @Schema(description = "Search query")
    private String query;

    @Schema(description = "Filter by tag")
    private String tag;

    @Schema(description = "Filter by category")
    private String category;

    @Schema(description = "Filter by post type")
    private String postType;

    @Schema(description = "Filter by community ID")
    private String communityId;

    @Schema(description = "Sort by: relevance, recent, popular, trending", example = "relevance")
    private String sortBy;

    @Schema(description = "Search communities instead of posts")
    private boolean searchCommunities;
}
