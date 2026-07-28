package com.skillinfinity.community.repository;

import com.skillinfinity.community.entity.Post;
import com.skillinfinity.community.enumeration.PostStatus;
import com.skillinfinity.community.enumeration.PostType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

    Page<Post> findByCommunityIdAndActiveTrueAndStatusOrderByCreatedAtDesc(
            UUID communityId, PostStatus status, Pageable pageable);

    Page<Post> findByCommunityIdAndPostTypeAndActiveTrueAndStatusOrderByCreatedAtDesc(
            UUID communityId, PostType postType, PostStatus status, Pageable pageable);

    Page<Post> findByAuthorIdAndActiveTrueOrderByCreatedAtDesc(UUID authorId, Pageable pageable);

    Optional<Post> findByIdAndActiveTrue(UUID id);

    @Query("SELECT p FROM Post p WHERE p.active = true AND p.status = 'PUBLISHED' AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Post> searchPosts(@Param("query") String query, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.active = true AND p.status = 'PUBLISHED' AND " +
           "LOWER(p.tags) LIKE LOWER(CONCAT('%', :tag, '%'))")
    Page<Post> findByTag(@Param("tag") String tag, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.active = true AND p.status = 'PUBLISHED' " +
           "ORDER BY (p.likeCount + p.commentCount + p.viewCount) DESC")
    List<Post> findTrendingPosts(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.active = true AND p.status = 'PUBLISHED' " +
           "ORDER BY p.likeCount DESC")
    List<Post> findPopularPosts(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.active = true AND p.pinned = true AND p.status = 'PUBLISHED' " +
           "ORDER BY p.updatedAt DESC")
    List<Post> findPinnedPosts();

    @Query("SELECT p FROM Post p WHERE p.community.id = :communityId AND p.active = true " +
           "AND p.pinned = true AND p.status = 'PUBLISHED' ORDER BY p.updatedAt DESC")
    List<Post> findPinnedPostsByCommunityId(@Param("communityId") UUID communityId);

    @Query("SELECT DISTINCT p.tags FROM Post p WHERE p.active = true AND p.status = 'PUBLISHED' " +
           "AND p.tags IS NOT NULL")
    List<String> findAllDistinctTags();

    @Query("SELECT p FROM Post p WHERE p.active = true AND p.status = 'PUBLISHED' " +
           "ORDER BY (p.likeCount + p.commentCount) DESC")
    List<Post> findTrending(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.active = true AND p.status = 'PUBLISHED' " +
           "AND p.createdAt >= :since ORDER BY p.likeCount DESC")
    List<Post> findTrendingSince(@Param("since") LocalDateTime since, Pageable pageable);

    Page<Post> findByStatusAndActiveTrue(PostStatus status, Pageable pageable);

    long countByAuthorIdAndActiveTrue(UUID authorId);

    long countByCommunityIdAndActiveTrue(UUID communityId);
}
