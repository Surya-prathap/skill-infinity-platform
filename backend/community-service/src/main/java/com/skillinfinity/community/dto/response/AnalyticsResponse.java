package com.skillinfinity.community.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Community analytics response")
public class AnalyticsResponse {

    @Schema(description = "Total communities count")
    private long totalCommunities;

    @Schema(description = "Total posts count")
    private long totalPosts;

    @Schema(description = "Total members count")
    private long totalMembers;

    @Schema(description = "Total comments count")
    private long totalComments;

    @Schema(description = "Popular tags with counts")
    private List<TagCountResponse> popularTags;

    @Schema(description = "Top contributors with post counts")
    private List<ContributorResponse> topContributors;

    @Schema(description = "Engagement metrics")
    private Map<String, Long> engagementMetrics;
}
