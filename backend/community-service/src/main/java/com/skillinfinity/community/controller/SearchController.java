package com.skillinfinity.community.controller;

import com.skillinfinity.common.dto.ApiResponse;
import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.community.dto.response.CommunityResponse;
import com.skillinfinity.community.dto.response.PostResponse;
import com.skillinfinity.community.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
@Tag(name = "Search", description = "Unified search across communities and posts")
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    @Operation(summary = "Search", description = "Searches posts and communities by keyword, tag, or category")
    public ResponseEntity<ApiResponse<PageResponse<PostResponse>>> search(
            @RequestParam String query,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String sortBy,
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID userId = extractUserId(principal);
        Page<PostResponse> results = searchService.searchPosts(query, tag, sortBy, page, size, userId);
        PageResponse<PostResponse> pageResponse = PageResponse.of(
                results.getContent(), results.getNumber(),
                results.getSize(), results.getTotalElements());
        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @GetMapping("/communities")
    @Operation(summary = "Search communities", description = "Searches communities by name or description")
    public ResponseEntity<ApiResponse<PageResponse<CommunityResponse>>> searchCommunities(
            @RequestParam String query,
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID userId = extractUserId(principal);
        Page<CommunityResponse> results = searchService.searchCommunities(query, page, size, userId);
        PageResponse<CommunityResponse> pageResponse = PageResponse.of(
                results.getContent(), results.getNumber(),
                results.getSize(), results.getTotalElements());
        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    private UUID extractUserId(Principal principal) {
        if (principal == null) {
            return UUID.randomUUID();
        }
        try {
            return UUID.fromString(principal.getName());
        } catch (IllegalArgumentException e) {
            return UUID.randomUUID();
        }
    }
}
