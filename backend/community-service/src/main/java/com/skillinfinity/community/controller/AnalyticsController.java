package com.skillinfinity.community.controller;

import com.skillinfinity.common.dto.ApiResponse;
import com.skillinfinity.community.dto.response.AnalyticsResponse;
import com.skillinfinity.community.dto.response.CommunityResponse;
import com.skillinfinity.community.dto.response.PostResponse;
import com.skillinfinity.community.dto.response.TagCountResponse;
import com.skillinfinity.community.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Platform analytics and statistics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get platform analytics", description = "Returns platform-wide analytics (Admin only)")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getPlatformAnalytics() {
        AnalyticsResponse response = analyticsService.getPlatformAnalytics();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/popular-posts")
    @Operation(summary = "Get popular posts", description = "Returns most popular posts")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getPopularPosts(
            @RequestParam(defaultValue = "10") int limit) {
        List<PostResponse> posts = analyticsService.getPopularPosts(limit);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @GetMapping("/trending-communities")
    @Operation(summary = "Get trending communities", description = "Returns trending communities")
    public ResponseEntity<ApiResponse<List<CommunityResponse>>> getTrendingCommunities(
            @RequestParam(defaultValue = "10") int limit) {
        List<CommunityResponse> communities = analyticsService.getTrendingCommunities(limit);
        return ResponseEntity.ok(ApiResponse.success(communities));
    }

    @GetMapping("/popular-tags")
    @Operation(summary = "Get popular tags", description = "Returns most used tags")
    public ResponseEntity<ApiResponse<List<TagCountResponse>>> getPopularTags(
            @RequestParam(defaultValue = "20") int limit) {
        List<TagCountResponse> tags = analyticsService.getPopularTags(limit);
        return ResponseEntity.ok(ApiResponse.success(tags));
    }
}
