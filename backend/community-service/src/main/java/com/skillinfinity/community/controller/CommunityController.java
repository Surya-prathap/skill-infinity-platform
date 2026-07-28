package com.skillinfinity.community.controller;

import com.skillinfinity.common.dto.ApiResponse;
import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.community.dto.request.CommunityRequest;
import com.skillinfinity.community.dto.response.CommunityResponse;
import com.skillinfinity.community.service.CommunityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/communities")
@RequiredArgsConstructor
@Tag(name = "Communities", description = "Community management, membership, and discovery")
public class CommunityController {

    private final CommunityService communityService;

    @PostMapping
    @Operation(summary = "Create community", description = "Creates a new community")
    public ResponseEntity<ApiResponse<CommunityResponse>> createCommunity(
            @Valid @RequestBody CommunityRequest request,
            Principal principal) {
        UUID userId = extractUserId(principal);
        CommunityResponse response = communityService.createCommunity(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Community created", response));
    }

    @GetMapping
    @Operation(summary = "Get communities", description = "Returns paginated list of communities")
    public ResponseEntity<ApiResponse<PageResponse<CommunityResponse>>> getCommunities(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID userId = extractUserId(principal);
        Page<CommunityResponse> communities = communityService.getCommunities(page, size, userId);
        PageResponse<CommunityResponse> pageResponse = PageResponse.of(
                communities.getContent(), communities.getNumber(),
                communities.getSize(), communities.getTotalElements());
        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get community", description = "Returns community details by ID")
    public ResponseEntity<ApiResponse<CommunityResponse>> getCommunity(
            @PathVariable UUID id,
            Principal principal) {
        UUID userId = extractUserId(principal);
        CommunityResponse response = communityService.getCommunity(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get community by slug", description = "Returns community details by slug")
    public ResponseEntity<ApiResponse<CommunityResponse>> getCommunityBySlug(
            @PathVariable String slug,
            Principal principal) {
        UUID userId = extractUserId(principal);
        CommunityResponse response = communityService.getCommunityBySlug(slug, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update community", description = "Updates an existing community")
    public ResponseEntity<ApiResponse<CommunityResponse>> updateCommunity(
            @PathVariable UUID id,
            @Valid @RequestBody CommunityRequest request,
            Principal principal) {
        UUID userId = extractUserId(principal);
        CommunityResponse response = communityService.updateCommunity(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success("Community updated", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete community", description = "Deletes a community (Owner only)")
    public ResponseEntity<ApiResponse<Void>> deleteCommunity(
            @PathVariable UUID id,
            Principal principal) {
        UUID userId = extractUserId(principal);
        communityService.deleteCommunity(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Community deleted", null));
    }

    @PostMapping("/{id}/join")
    @Operation(summary = "Join community", description = "Join a community")
    public ResponseEntity<ApiResponse<Void>> joinCommunity(
            @PathVariable UUID id,
            Principal principal) {
        UUID userId = extractUserId(principal);
        communityService.joinCommunity(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Joined community", null));
    }

    @PostMapping("/{id}/leave")
    @Operation(summary = "Leave community", description = "Leave a community")
    public ResponseEntity<ApiResponse<Void>> leaveCommunity(
            @PathVariable UUID id,
            Principal principal) {
        UUID userId = extractUserId(principal);
        communityService.leaveCommunity(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Left community", null));
    }

    @GetMapping("/my")
    @Operation(summary = "Get my communities", description = "Returns communities the current user belongs to")
    public ResponseEntity<ApiResponse<PageResponse<CommunityResponse>>> getMyCommunities(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID userId = extractUserId(principal);
        Page<CommunityResponse> communities = communityService.getUserCommunities(userId, page, size, userId);
        PageResponse<CommunityResponse> pageResponse = PageResponse.of(
                communities.getContent(), communities.getNumber(),
                communities.getSize(), communities.getTotalElements());
        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @GetMapping("/search")
    @Operation(summary = "Search communities", description = "Searches communities by name or description")
    public ResponseEntity<ApiResponse<PageResponse<CommunityResponse>>> searchCommunities(
            @RequestParam String query,
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID userId = extractUserId(principal);
        Page<CommunityResponse> communities = communityService.searchCommunities(query, page, size, userId);
        PageResponse<CommunityResponse> pageResponse = PageResponse.of(
                communities.getContent(), communities.getNumber(),
                communities.getSize(), communities.getTotalElements());
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
