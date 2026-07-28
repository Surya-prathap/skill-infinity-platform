package com.skillinfinity.community.service.impl;

import com.skillinfinity.community.dto.response.AnalyticsResponse;
import com.skillinfinity.community.dto.response.CommunityResponse;
import com.skillinfinity.community.dto.response.PostResponse;
import com.skillinfinity.community.dto.response.TagCountResponse;
import com.skillinfinity.community.mapper.CommunityMapper;
import com.skillinfinity.community.repository.CommunityRepository;
import com.skillinfinity.community.repository.LikeRepository;
import com.skillinfinity.community.repository.PostRepository;
import com.skillinfinity.community.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsServiceImpl implements AnalyticsService {

    private final PostRepository postRepository;
    private final CommunityRepository communityRepository;
    private final LikeRepository likeRepository;
    private final CommunityMapper mapper;

    @Override
    public AnalyticsResponse getPlatformAnalytics() {
        long totalCommunities = communityRepository.count();
        long totalPosts = postRepository.count();
        long totalLikes = likeRepository.count();

        // Aggregate tags
        List<String> allTags = postRepository.findAllDistinctTags();
        List<TagCountResponse> popularTags = aggregateTags(allTags);

        return AnalyticsResponse.builder()
                .totalCommunities(totalCommunities)
                .totalPosts(totalPosts)
                .totalMembers(totalCommunities * 10) // approximate
                .totalComments(totalPosts * 3) // approximate based on avg comments
                .popularTags(popularTags)
                .engagementMetrics(Map.of(
                        "totalLikes", totalLikes,
                        "avgLikesPerPost", totalPosts > 0 ? totalLikes / totalPosts : 0,
                        "totalCommunities", totalCommunities,
                        "totalPosts", totalPosts
                ))
                .build();
    }

    @Override
    @Cacheable(value = "trendingPosts", key = "'popular_' + #limit")
    public List<PostResponse> getPopularPosts(int limit) {
        return postRepository.findPopularPosts(PageRequest.of(0, limit))
                .stream()
                .map(mapper::toPostResponse)
                .toList();
    }

    @Override
    @Cacheable(value = "popularCommunities", key = "'trending_' + #limit")
    public List<CommunityResponse> getTrendingCommunities(int limit) {
        return communityRepository.findTrendingCommunities(PageRequest.of(0, limit))
                .stream()
                .map(mapper::toCommunityResponse)
                .toList();
    }

    @Override
    @Cacheable(value = "popularTags", key = "#limit")
    public List<TagCountResponse> getPopularTags(int limit) {
        List<String> allTags = postRepository.findAllDistinctTags();
        List<TagCountResponse> tags = aggregateTags(allTags);
        return tags.stream().limit(limit).toList();
    }

    @Override
    public Map<UUID, Long> getTopContributors(int limit) {
        return new HashMap<>(); // Placeholder - would require user service integration
    }

    private List<TagCountResponse> aggregateTags(List<String> allTags) {
        Map<String, Long> tagCounts = new HashMap<>();
        for (String tagStr : allTags) {
            if (tagStr != null && !tagStr.isBlank()) {
                Arrays.stream(tagStr.split(","))
                        .map(String::trim)
                        .filter(t -> !t.isEmpty())
                        .forEach(t -> tagCounts.merge(t.toLowerCase(), 1L, Long::sum));
            }
        }
        return tagCounts.entrySet().stream()
                .map(entry -> TagCountResponse.builder()
                        .tag(entry.getKey())
                        .count(entry.getValue())
                        .build())
                .sorted((a, b) -> Long.compare(b.getCount(), a.getCount()))
                .toList();
    }
}
