package com.skillinfinity.community.service;

import com.skillinfinity.community.dto.request.CommentRequest;
import com.skillinfinity.community.dto.response.CommentResponse;
import org.springframework.data.domain.Page;

import java.util.UUID;

public interface CommentService {

    CommentResponse createComment(CommentRequest request, UUID authorId);

    void deleteComment(UUID commentId, UUID userId);

    Page<CommentResponse> getCommentsByPost(UUID postId, int page, int size, UUID currentUserId);

    Page<CommentResponse> getReplies(UUID parentId, int page, int size, UUID currentUserId);

    void likeComment(UUID commentId, UUID userId);

    void unlikeComment(UUID commentId, UUID userId);
}
