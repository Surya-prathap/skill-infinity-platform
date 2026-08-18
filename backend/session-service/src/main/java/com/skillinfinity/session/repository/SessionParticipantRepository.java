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

    long countBySessionIdAndRole(UUID sessionId, String role);

    /**
     * Learner counts grouped by session (single query for list rendering,
     * avoids N+1 count lookups when enriching community seat summaries).
     */
    @Query("SELECT sp.sessionId, COUNT(sp) FROM SessionParticipant sp "
            + "WHERE sp.sessionId IN :sessionIds AND sp.role = 'LEARNER' GROUP BY sp.sessionId")
    List<Object[]> countLearnersBySessionIds(@Param("sessionIds") List<UUID> sessionIds);

    @Query("SELECT sp.sessionId, COUNT(sp) FROM SessionParticipant sp "
            + "WHERE sp.sessionId IN :sessionIds GROUP BY sp.sessionId")
    List<Object[]> countBySessionIds(@Param("sessionIds") List<UUID> sessionIds);

    List<SessionParticipant> findBySessionIdAndRole(UUID sessionId, String role);

    boolean existsBySessionIdAndUserId(UUID sessionId, UUID userId);

    void deleteBySessionId(UUID sessionId);

    // ============================================================
    // Community session analytics
    //
    // Only successfully completed TRUE-FREE (0-credit) community sessions
    // count toward the mentor's free-session benefits.
    // ============================================================

    @Query("SELECT DISTINCT p.userId FROM SessionParticipant p WHERE p.role = 'LEARNER' AND p.sessionId IN " +
            "(SELECT s.id FROM Session s WHERE s.community = true AND s.mentorId = :mentorId " +
            "AND s.status = 'COMPLETED' AND s.price = 0)")
    List<UUID> findDistinctCommunityLearners(@Param("mentorId") UUID mentorId);

    @Query("SELECT COUNT(DISTINCT p.userId) FROM SessionParticipant p WHERE p.role = 'LEARNER' AND p.sessionId IN " +
            "(SELECT s.id FROM Session s WHERE s.community = true AND s.mentorId = :mentorId " +
            "AND s.status = 'COMPLETED' AND s.price = 0)")
    long countDistinctCommunityLearners(@Param("mentorId") UUID mentorId);

    /**
     * Free community sessions joined by a learner since a cutoff — only joins
     * to 0-credit community sessions count against the monthly free-session
     * allowance. Paid (1–3 credit) community sessions are excluded.
     */
    @Query("SELECT COUNT(p) FROM SessionParticipant p WHERE p.userId = :userId AND p.role = 'LEARNER' "
            + "AND p.joinedAt >= :joinedSince AND p.sessionId IN "
            + "(SELECT s.id FROM Session s WHERE s.community = true AND s.price = 0)")
    long countFreeCommunityJoinsSince(@Param("userId") UUID userId,
                                      @Param("joinedSince") LocalDateTime joinedSince);

    long countByUserIdAndRoleAndJoinedAtGreaterThanEqual(UUID userId, String role, LocalDateTime joinedSince);
}
