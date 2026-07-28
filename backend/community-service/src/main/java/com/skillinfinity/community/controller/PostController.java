package com.skillinfinity.community.controller;

import com.skillinfinity.common.dto.ApiResponse;
import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.community.dto.request.PostRequest;
import com.skillinfinity.community.dto.response.PostResponse;
import com.skillinfinity.community.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
@Tag(name = "Posts", description = "Post management, likes, bookmarks, and discovery")
public class PostController {

    private final PostService postService;

    @PostMapping
    @Operation(summary = "Create post", description = "Creates a new post")
    public ResponseEntity<ApiResponse<PostResponse>> createPost(
            @Valid @RequestBody PostRequest request,
            Principal principal) {
        UUID userId = extractUserId(principal);
        PostResponse response = postService.createPost(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Post created", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update post", description = "Updates an existing post")
    public ResponseEntity<ApiResponse<PostResponse>> updatePost(
            @PathVariable UUID id,
            @Valid @RequestBody PostRequest request,
            Principal principal) {
        UUID userId = extractUserId(principal);
        PostResponse response = postService.updatePost(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success("Post updated", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete post", description = "Deletes a post")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            @PathVariable UUID id,
            Principal principal) {
        UUID userId = extractUserId(principal);
        postService.deletePost(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Post deleted", null));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get post", description = "Returns post details by ID")
    public ResponseEntity<ApiResponse<PostResponse>> getPost(
            @PathVariable UUID id,
            Principal principal) {
        UUID userId = extractUserId(principal);
        PostResponse response = postService.getPost(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @Operation(summary = "Get posts by community", description = "Returns paginated posts for a community")
    public ResponseEntity<ApiResponse<PageResponse<PostResponse>>> getPostsByCommunity(
            @RequestParam(required = false) UUID communityId,
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID userId = extractUserId(principal);
        Page<PostResponse> posts = postService.getPostsByCommunity(communityId, page, size, userId);
        PageResponse<PostResponse> pageResponse = PageResponse.of(
                posts.getContent(), posts.getNumber(),
                posts.getSize(), posts.getTotalElements());
        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get posts by user", description = "Returns paginated posts by a specific user")
    public ResponseEntity<ApiResponse<PageResponse<PostResponse>>> getPostsByUser(
            @PathVariable UUID userId,
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID currentUserId = extractUserId(principal);
        Page<PostResponse> posts = postService.getPostsByUser(userId, page, size, currentUserId);
        PageResponse<PostResponse> pageResponse = PageResponse.of(
                posts.getContent(), posts.getNumber(),
                posts.getSize(), posts.getTotalElements());
        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @PostMapping("/{id}/like")
    @Operation(summary = "Like post", description = "Likes a post")
    public ResponseEntity<ApiResponse<Void>> likePost(
            @PathVariable UUID id,
            Principal principal) {
        UUID userId = extractUserId(principal);
        postService.likePost(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Post liked", null));
    }

    @PostMapping("/{id}/unlike")
    @Operation(summary = "Unlike post", description = "Removes like from a post")
    public ResponseEntity<ApiResponse<Void>> unlikePost(
            @PathVariable UUID id,
            Principal principal) {
        UUID userId = extractUserId(principal);
        postService.unlikePost(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Post unliked", null));
    }

    @PostMapping("/{id}/bookmark")
    @Operation(summary = "Bookmark post", description = "Bookmarks a post")
    public ResponseEntity<ApiResponse<Void>> bookmarkPost(
            @PathVariable UUID id,
            Principal principal) {
        UUID userId = extractUserId(principal);
        postService.bookmarkPost(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Post bookmarked", null));
    }

    @PostMapping("/{id}/unbookmark")
    @Operation(summary = "Unbookmark post", description = "Removes bookmark from a post")
    public ResponseEntity<ApiResponse<Void>> unbookmarkPost(
            @PathVariable UUID id,
            Principal principal) {
        UUID userId = extractUserId(principal);
        postService.unbookmarkPost(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Post unbookmarked", null));
    }

    @GetMapping("/trending")
    @Operation(summary = "Get trending posts", description = "Returns trending posts")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getTrendingPosts(
            @RequestParam(defaultValue = "10") int limit) {
        List<PostResponse> posts = postService.getTrendingPosts(limit);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @GetMapping("/pinned")
    @Operation(summary = "Get pinned posts", description = "Returns pinned posts")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getPinnedPosts(
            @RequestParam(required = false) UUID communityId) {
        List<PostResponse> posts = postService.getPinnedPosts(communityId);
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @GetMapping("/popular")
    @Operation(summary = "Get popular posts", description = "Returns popular posts")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getPopularPosts(
            @RequestParam(defaultValue = "10") int limit) {
        List<PostResponse> posts = postService.getPopularPosts(limit);
        return ResponseEntity.ok(ApiResponse.success(posts));
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
