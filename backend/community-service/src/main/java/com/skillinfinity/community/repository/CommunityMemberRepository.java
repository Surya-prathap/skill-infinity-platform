package com.skillinfinity.community.repository;

import com.skillinfinity.community.entity.CommunityMember;
import com.skillinfinity.community.enumeration.MembershipRole;
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
public interface CommunityMemberRepository extends JpaRepository<CommunityMember, UUID> {

    Optional<CommunityMember> findByCommunityIdAndUserIdAndActiveTrue(UUID communityId, UUID userId);

    boolean existsByCommunityIdAndUserIdAndActiveTrue(UUID communityId, UUID userId);

    @Query("SELECT m.userId FROM CommunityMember m WHERE m.community.id = :communityId AND m.active = true")
    List<UUID> findActiveUserIdsByCommunityId(@Param("communityId") UUID communityId);

    Page<CommunityMember> findByCommunityIdAndActiveTrue(UUID communityId, Pageable pageable);

    long countByCommunityIdAndActiveTrue(UUID communityId);

    long countByCommunityIdAndRoleAndActiveTrue(UUID communityId, MembershipRole role);

    @Query("SELECT m FROM CommunityMember m JOIN FETCH m.community WHERE m.userId = :userId AND m.active = true")
    List<CommunityMember> findAllByUserIdWithCommunity(@Param("userId") UUID userId);

    @Query("SELECT m.userId FROM CommunityMember m WHERE m.community.id = :communityId " +
           "AND m.role IN :roles AND m.active = true")
    List<UUID> findUserIdsByCommunityIdAndRoles(@Param("communityId") UUID communityId,
                                                  @Param("roles") List<MembershipRole> roles);

    boolean existsByCommunityIdAndUserIdAndRoleAndActiveTrue(UUID communityId, UUID userId, MembershipRole role);
}
