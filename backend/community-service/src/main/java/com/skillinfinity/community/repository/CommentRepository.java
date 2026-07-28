package com.skillinfinity.community.repository;

import com.skillinfinity.community.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {

    Page<Comment> findByPostIdAndParentIdIsNullAndActiveTrueOrderByCreatedAtDesc(
            UUID postId, Pageable pageable);

    Page<Comment> findByParentIdAndActiveTrueOrderByCreatedAtAsc(
            UUID parentId, Pageable pageable);

    List<Comment> findByPostIdAndActiveTrueOrderByCreatedAtAsc(UUID postId);

    Page<Comment> findByAuthorIdAndActiveTrueOrderByCreatedAtDesc(UUID authorId, Pageable pageable);

    List<Comment> findByParentIdAndActiveTrue(UUID parentId);

    long countByPostIdAndActiveTrue(UUID postId);

    long countByParentIdAndActiveTrue(UUID parentId);

    @Modifying
    @Query("UPDATE Comment c SET c.likeCount = c.likeCount + :delta WHERE c.id = :commentId")
    void updateLikeCount(@Param("commentId") UUID commentId, @Param("delta") int delta);
}
