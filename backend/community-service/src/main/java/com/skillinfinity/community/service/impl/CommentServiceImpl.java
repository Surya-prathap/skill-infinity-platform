package com.skillinfinity.community.service.impl;

import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.common.exception.ForbiddenException;
import com.skillinfinity.community.dto.request.CommentRequest;
import com.skillinfinity.community.dto.response.CommentResponse;
import com.skillinfinity.community.entity.Comment;
import com.skillinfinity.community.entity.Like;
import com.skillinfinity.community.entity.Post;
import com.skillinfinity.community.event.CommentEventPublisher;
import com.skillinfinity.community.exception.CommentNotFoundException;
import com.skillinfinity.community.exception.PostNotFoundException;
import com.skillinfinity.community.mapper.CommunityMapper;
import com.skillinfinity.community.repository.CommentRepository;
import com.skillinfinity.community.repository.LikeRepository;
import com.skillinfinity.community.repository.PostRepository;
import com.skillinfinity.community.service.CommentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final LikeRepository likeRepository;
    private final CommunityMapper mapper;

    @Override
    public CommentResponse createComment(CommentRequest request, UUID authorId) {
        log.info("Creating comment on post: {} by user: {}", request.getPostId(), authorId);

        Post post = postRepository.findByIdAndActiveTrue(request.getPostId())
                .orElseThrow(() -> new PostNotFoundException(request.getPostId().toString()));

        int depth = 0;
        if (request.getParentId() != null) {
            Comment parentComment = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new CommentNotFoundException(request.getParentId().toString()));
            depth = parentComment.getDepth() + 1;

            // Update parent reply count
            parentComment.setReplyCount(parentComment.getReplyCount() + 1);
            commentRepository.save(parentComment);
        }

        Comment comment = Comment.builder()
                .id(UUID.randomUUID())
                .post(post)
                .parentId(request.getParentId())
                .content(request.getContent())
                .authorId(authorId)
                .depth(depth)
                .createdBy(authorId.toString())
                .updatedBy(authorId.toString())
                .build();

        comment = commentRepository.save(comment);

        // Update post comment count
        post.setCommentCount(post.getCommentCount() + 1);
        postRepository.save(post);

        log.info("Comment created: {} on post: {}", comment.getId(), request.getPostId());
        return mapper.toCommentResponse(comment);
    }

    @Override
    public void deleteComment(UUID commentId, UUID userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException(commentId.toString()));

        if (!comment.getAuthorId().equals(userId)) {
            throw new ForbiddenException("You can only delete your own comments");
        }

        comment.setActive(false);
        comment.setUpdatedBy(userId.toString());
        commentRepository.save(comment);

        // Update post comment count
        Post post = comment.getPost();
        post.setCommentCount(Math.max(0, post.getCommentCount() - 1));
        postRepository.save(post);

        log.info("Comment deleted: {}", commentId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CommentResponse> getCommentsByPost(UUID postId, int page, int size, UUID currentUserId) {
        Page<Comment> comments = commentRepository.findByPostIdAndParentIdIsNullAndActiveTrueOrderByCreatedAtDesc(
                postId, PageRequest.of(page, size));
        return comments.map(comment -> {
            CommentResponse response = mapper.toCommentResponse(comment);
            populateLikeInfo(response, comment.getId(), currentUserId);
            return response;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CommentResponse> getReplies(UUID parentId, int page, int size, UUID currentUserId) {
        Page<Comment> replies = commentRepository.findByParentIdAndActiveTrueOrderByCreatedAtAsc(
                parentId, PageRequest.of(page, size));
        return replies.map(comment -> {
            CommentResponse response = mapper.toCommentResponse(comment);
            populateLikeInfo(response, comment.getId(), currentUserId);
            return response;
        });
    }

    @Override
    public void likeComment(UUID commentId, UUID userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException(commentId.toString()));

        if (likeRepository.existsByCommentIdAndUserIdAndActiveTrue(commentId, userId)) {
            throw new BadRequestException("You have already liked this comment");
        }

        Like like = Like.builder()
                .id(UUID.randomUUID())
                .comment(comment)
                .userId(userId)
                .build();

        likeRepository.save(like);
        comment.setLikeCount(comment.getLikeCount() + 1);
        commentRepository.save(comment);
        log.debug("User {} liked comment {}", userId, commentId);
    }

    @Override
    public void unlikeComment(UUID commentId, UUID userId) {
        Like like = likeRepository.findByCommentIdAndUserIdAndActiveTrue(commentId, userId)
                .orElseThrow(() -> new BadRequestException("You have not liked this comment"));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException(commentId.toString()));

        like.setActive(false);
        likeRepository.save(like);
        comment.setLikeCount(Math.max(0, comment.getLikeCount() - 1));
        commentRepository.save(comment);
        log.debug("User {} unliked comment {}", userId, commentId);
    }

    private void populateLikeInfo(CommentResponse response, UUID commentId, UUID userId) {
        if (userId != null) {
            response.setLikedByMe(likeRepository.existsByCommentIdAndUserIdAndActiveTrue(commentId, userId));
        }
    }
}
