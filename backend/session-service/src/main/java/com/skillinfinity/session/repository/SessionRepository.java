package com.skillinfinity.session.repository;

import com.skillinfinity.session.entity.Session;
import com.skillinfinity.session.enumeration.SessionStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SessionRepository extends JpaRepository<Session, UUID> {

    List<Session> findByMentorIdOrderByStartTimeDesc(UUID mentorId);

    List<Session> findByLearnerIdOrderByStartTimeDesc(UUID learnerId);

    Page<Session> findByMentorId(UUID mentorId, Pageable pageable);

    Page<Session> findByLearnerId(UUID learnerId, Pageable pageable);

    List<Session> findByMentorIdAndStatusIn(UUID mentorId, List<SessionStatus> statuses);

    List<Session> findByLearnerIdAndStatusIn(UUID learnerId, List<SessionStatus> statuses);

    @Query("SELECT s FROM Session s WHERE s.mentorId = :userId OR s.learnerId = :userId ORDER BY s.startTime DESC")
    Page<Session> findByUserId(@Param("userId") UUID userId, Pageable pageable);

    /**
     * Upcoming/active sessions for a user. A session stays in this list for
     * its WHOLE time window — from the join-eligible pre-start period through
     * the end time — and only leaves once it is terminal (completed,
     * cancelled, rejected, no-show, expired) or its end time has passed.
     * A session must NEVER disappear just because startTime has passed while
     * it is still active.
     */
    @Query("SELECT s FROM Session s WHERE (s.mentorId = :userId OR s.learnerId = :userId) AND s.endTime >= :now "
            + "AND s.status NOT IN ('COMPLETED', 'CANCELLED', 'REJECTED', 'NO_SHOW', 'EXPIRED') ORDER BY s.startTime ASC")
    Page<Session> findUpcomingByUserId(@Param("userId") UUID userId, @Param("now") LocalDateTime now, Pageable pageable);

    /**
     * History for a user: terminal sessions (completed, cancelled, rejected,
     * no-show, expired) plus any session whose time window has fully passed
     * (end time in the past) even if it was never explicitly completed.
     */
    @Query("SELECT s FROM Session s WHERE (s.mentorId = :userId OR s.learnerId = :userId) "
            + "AND (s.status IN ('COMPLETED', 'CANCELLED', 'REJECTED', 'NO_SHOW', 'EXPIRED') OR s.endTime < :now) "
            + "ORDER BY s.startTime DESC")
    Page<Session> findHistoryByUserId(@Param("userId") UUID userId, @Param("now") LocalDateTime now, Pageable pageable);

    @Query("SELECT s FROM Session s WHERE s.mentorId = :mentorId AND s.startTime >= :start AND s.endTime <= :end ORDER BY s.startTime ASC")
    List<Session> findByMentorIdAndTimeRange(@Param("mentorId") UUID mentorId,
                                              @Param("start") LocalDateTime start,
                                              @Param("end") LocalDateTime end);

    @Query("SELECT s FROM Session s WHERE s.learnerId = :learnerId AND s.startTime >= :start AND s.endTime <= :end ORDER BY s.startTime ASC")
    List<Session> findByLearnerIdAndTimeRange(@Param("learnerId") UUID learnerId,
                                               @Param("start") LocalDateTime start,
                                               @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(s) FROM Session s WHERE s.mentorId = :mentorId AND s.startTime >= :dayStart AND s.startTime <= :dayEnd AND s.status NOT IN ('CANCELLED', 'REJECTED')")
    long countByMentorIdAndDateRange(@Param("mentorId") UUID mentorId,
                                      @Param("dayStart") LocalDateTime dayStart,
                                      @Param("dayEnd") LocalDateTime dayEnd);

    @Query("SELECT COUNT(s) FROM Session s WHERE s.learnerId = :learnerId AND s.startTime >= :dayStart AND s.startTime <= :dayEnd AND s.status NOT IN ('CANCELLED', 'REJECTED')")
    long countByLearnerIdAndDateRange(@Param("learnerId") UUID learnerId,
                                       @Param("dayStart") LocalDateTime dayStart,
                                       @Param("dayEnd") LocalDateTime dayEnd);

    @Query("SELECT s FROM Session s WHERE s.status = :status AND s.startTime <= :time")
    List<Session> findByStatusAndStartTimeBefore(@Param("status") SessionStatus status,
                                                  @Param("time") LocalDateTime time);

    /**
     * Sessions whose scheduled window has fully passed but which were never
     * explicitly finished — auto-completed by the SessionCompletionJob so no
     * session can stay "active" (and hold frozen credits) forever.
     */
    @Query("SELECT s FROM Session s WHERE s.endTime <= :now "
            + "AND s.status IN ('APPROVED', 'SCHEDULED', 'IN_PROGRESS')")
    List<Session> findSessionsToAutoComplete(@Param("now") LocalDateTime now);

    @Query("SELECT s FROM Session s WHERE s.startTime >= :now AND s.status IN ('APPROVED', 'SCHEDULED')")
    List<Session> findSessionsForReminders(@Param("now") LocalDateTime now);

    boolean existsByMentorIdAndStartTimeAndEndTimeAndStatusNotIn(
            UUID mentorId, LocalDateTime startTime, LocalDateTime endTime, List<SessionStatus> statuses);

    // ============================================================
    // Community sessions
    // ============================================================

    /**
     * Upcoming community sessions — only still-open sessions whose time window
     * has not fully passed are listed, so an outdated session never remains
     * joinable in the community tab.
     */
    @Query("SELECT s FROM Session s WHERE s.community = true AND s.status = 'SCHEDULED' "
            + "AND s.startTime >= :now AND s.endTime >= :now ORDER BY s.startTime ASC")
    Page<Session> findUpcomingCommunitySessions(@Param("now") LocalDateTime now, Pageable pageable);

    /**
     * Serializes concurrent bookings of the same community session: the row
     * lock is held until the enclosing transaction commits, so simultaneous
     * join attempts observe each other's seat counts and overbooking (21+/20
     * learners) is impossible.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Session s WHERE s.id = :id")
    java.util.Optional<Session> findByIdForUpdate(@Param("id") UUID id);

    /**
     * Free-session benefits count ONLY successfully completed TRUE-FREE
     * community sessions — i.e. cost = 0 credits. A 1–3 credit community
     * session is a paid session and must never count toward the milestone.
     */
    @Query("SELECT COUNT(s) FROM Session s WHERE s.community = true AND s.mentorId = :mentorId "
            + "AND s.status = 'COMPLETED' AND s.price = 0")
    long countCompletedCommunityByMentor(@Param("mentorId") UUID mentorId);

    @Query("SELECT COALESCE(SUM(s.durationMinutes), 0) FROM Session s WHERE s.community = true AND s.mentorId = :mentorId "
            + "AND s.status = 'COMPLETED' AND s.price = 0")
    long sumCommunityMinutesByMentor(@Param("mentorId") UUID mentorId);

    @Query("SELECT COUNT(s) FROM Session s WHERE s.community = true AND s.mentorId = :mentorId "
            + "AND s.status = 'COMPLETED' AND s.price = 0 AND s.startTime >= :monthStart")
    long countCompletedCommunityByMentorSince(@Param("mentorId") UUID mentorId,
                                               @Param("monthStart") LocalDateTime monthStart);

    @Query("SELECT s FROM Session s WHERE s.community = true AND s.mentorId = :mentorId "
            + "AND s.status = 'COMPLETED' AND s.price = 0")
    List<Session> findCompletedCommunityByMentor(@Param("mentorId") UUID mentorId);
}
