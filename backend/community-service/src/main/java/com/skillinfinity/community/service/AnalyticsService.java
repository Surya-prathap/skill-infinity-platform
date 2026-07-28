package com.skillinfinity.community.service;

import com.skillinfinity.community.dto.response.AnalyticsResponse;
import com.skillinfinity.community.dto.response.CommunityResponse;
import com.skillinfinity.community.dto.response.PostResponse;
import com.skillinfinity.community.dto.response.TagCountResponse;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface AnalyticsService {

    AnalyticsResponse getPlatformAnalytics();

    List<PostResponse> getPopularPosts(int limit);

    List<CommunityResponse> getTrendingCommunities(int limit);

    List<TagCountResponse> getPopularTags(int limit);

    Map<UUID, Long> getTopContributors(int limit);
}
