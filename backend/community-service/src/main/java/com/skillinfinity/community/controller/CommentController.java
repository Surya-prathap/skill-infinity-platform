package com.skillinfinity.community.controller;

import com.skillinfinity.common.dto.ApiResponse;
import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.community.dto.request.CommentRequest;
import com.skillinfinity.community.dto.response.CommentResponse;
import com.skillinfinity.community.service.CommentService;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/comments")
@RequiredArgsConstructor
@Tag(name = "Comments", description = "Comment and reply management")
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    @Operation(summary = "Create comment", description = "Creates a new comment on a post")
    public ResponseEntity<ApiResponse<CommentResponse>> createComment(
            @Valid @RequestBody CommentRequest request,
            Principal principal) {
        UUID userId = extractUserId(principal);
        CommentResponse response = commentService.createComment(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment created", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete comment", description = "Deletes a comment")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable UUID id,
            Principal principal) {
        UUID userId = extractUserId(principal);
        commentService.deleteComment(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Comment deleted", null));
    }

    @GetMapping("/post/{postId}")
    @Operation(summary = "Get post comments", description = "Returns paginated comments for a post")
    public ResponseEntity<ApiResponse<PageResponse<CommentResponse>>> getCommentsByPost(
            @PathVariable UUID postId,
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID userId = extractUserId(principal);
        Page<CommentResponse> comments = commentService.getCommentsByPost(postId, page, size, userId);
        PageResponse<CommentResponse> pageResponse = PageResponse.of(
                comments.getContent(), comments.getNumber(),
                comments.getSize(), comments.getTotalElements());
        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @GetMapping("/replies/{parentId}")
    @Operation(summary = "Get comment replies", description = "Returns paginated replies for a comment")
    public ResponseEntity<ApiResponse<PageResponse<CommentResponse>>> getReplies(
            @PathVariable UUID parentId,
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID userId = extractUserId(principal);
        Page<CommentResponse> replies = commentService.getReplies(parentId, page, size, userId);
        PageResponse<CommentResponse> pageResponse = PageResponse.of(
                replies.getContent(), replies.getNumber(),
                replies.getSize(), replies.getTotalElements());
        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @PostMapping("/{id}/like")
    @Operation(summary = "Like comment", description = "Likes a comment")
    public ResponseEntity<ApiResponse<Void>> likeComment(
            @PathVariable UUID id,
            Principal principal) {
        UUID userId = extractUserId(principal);
        commentService.likeComment(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Comment liked", null));
    }

    @PostMapping("/{id}/unlike")
    @Operation(summary = "Unlike comment", description = "Removes like from a comment")
    public ResponseEntity<ApiResponse<Void>> unlikeComment(
            @PathVariable UUID id,
            Principal principal) {
        UUID userId = extractUserId(principal);
        commentService.unlikeComment(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Comment unliked", null));
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
