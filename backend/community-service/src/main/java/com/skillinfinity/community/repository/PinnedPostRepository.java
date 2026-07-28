package com.skillinfinity.community.repository;

import com.skillinfinity.community.entity.PinnedPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PinnedPostRepository extends JpaRepository<PinnedPost, UUID> {

    List<PinnedPost> findByCommunityIdAndActiveTrueOrderByPinOrderAsc(UUID communityId);

    Optional<PinnedPost> findByPostIdAndActiveTrue(UUID postId);

    void deleteByPostId(UUID postId);
}
