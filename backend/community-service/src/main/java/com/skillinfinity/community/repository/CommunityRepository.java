package com.skillinfinity.community.repository;

import com.skillinfinity.community.entity.Community;
import com.skillinfinity.community.enumeration.CommunityVisibility;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CommunityRepository extends JpaRepository<Community, UUID> {

    Optional<Community> findBySlugAndActiveTrue(String slug);

    Page<Community> findByActiveTrueOrderByMemberCountDesc(Pageable pageable);

    Page<Community> findByVisibilityAndActiveTrue(CommunityVisibility visibility, Pageable pageable);

    @Query("SELECT c FROM Community c WHERE c.active = true AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Community> searchCommunities(@Param("query") String query, Pageable pageable);

    @Query("SELECT c FROM Community c JOIN c.members m WHERE m.userId = :userId AND m.active = true AND c.active = true")
    Page<Community> findCommunitiesByMemberId(@Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT c FROM Community c WHERE c.active = true ORDER BY c.memberCount DESC")
    List<Community> findPopularCommunities(Pageable pageable);

    @Query("SELECT c FROM Community c WHERE c.active = true ORDER BY c.postCount DESC")
    List<Community> findTrendingCommunities(Pageable pageable);

    long countByOwnerIdAndActiveTrue(UUID ownerId);
}
