package com.skillinfinity.session.repository;

import com.skillinfinity.session.entity.SessionParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SessionParticipantRepository extends JpaRepository<SessionParticipant, UUID> {

    List<SessionParticipant> findBySessionId(UUID sessionId);

    Optional<SessionParticipant> findBySessionIdAndUserId(UUID sessionId, UUID userId);

    List<SessionParticipant> findByUserId(UUID userId);

    long countBySessionId(UUID sessionId);

    boolean existsBySessionIdAndUserId(UUID sessionId, UUID userId);

    void deleteBySessionId(UUID sessionId);

    // ============================================================
    // Community session analytics
    // ============================================================

    @Query("SELECT DISTINCT p.userId FROM SessionParticipant p WHERE p.role = 'LEARNER' AND p.sessionId IN " +
            "(SELECT s.id FROM Session s WHERE s.community = true AND s.mentorId = :mentorId AND s.status = 'COMPLETED')")
    List<UUID> findDistinctCommunityLearners(@Param("mentorId") UUID mentorId);

    @Query("SELECT COUNT(DISTINCT p.userId) FROM SessionParticipant p WHERE p.role = 'LEARNER' AND p.sessionId IN " +
            "(SELECT s.id FROM Session s WHERE s.community = true AND s.mentorId = :mentorId AND s.status = 'COMPLETED')")
    long countDistinctCommunityLearners(@Param("mentorId") UUID mentorId);

    long countByUserIdAndRoleAndJoinedAtGreaterThanEqual(UUID userId, String role, LocalDateTime joinedSince);
}
