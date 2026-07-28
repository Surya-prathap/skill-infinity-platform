package com.skillinfinity.community.repository;

import com.skillinfinity.community.entity.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LikeRepository extends JpaRepository<Like, UUID> {

    Optional<Like> findByPostIdAndUserIdAndActiveTrue(UUID postId, UUID userId);

    Optional<Like> findByCommentIdAndUserIdAndActiveTrue(UUID commentId, UUID userId);

    boolean existsByPostIdAndUserIdAndActiveTrue(UUID postId, UUID userId);

    boolean existsByCommentIdAndUserIdAndActiveTrue(UUID commentId, UUID userId);

    long countByPostIdAndActiveTrue(UUID postId);

    long countByCommentIdAndActiveTrue(UUID commentId);

    long countByUserIdAndActiveTrue(UUID userId);
}
