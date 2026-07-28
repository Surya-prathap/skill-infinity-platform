package com.skillinfinity.community.repository;

import com.skillinfinity.community.entity.Bookmark;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, UUID> {

    Optional<Bookmark> findByPostIdAndUserIdAndActiveTrue(UUID postId, UUID userId);

    boolean existsByPostIdAndUserIdAndActiveTrue(UUID postId, UUID userId);

    Page<Bookmark> findByUserIdAndActiveTrueOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    long countByPostIdAndActiveTrue(UUID postId);

    long countByUserIdAndActiveTrue(UUID userId);
}
