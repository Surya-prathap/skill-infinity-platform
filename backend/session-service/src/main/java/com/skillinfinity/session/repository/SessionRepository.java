package com.skillinfinity.session.repository;

import com.skillinfinity.session.entity.Session;
import com.skillinfinity.session.enumeration.SessionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
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

    @Query("SELECT s FROM Session s WHERE (s.mentorId = :userId OR s.learnerId = :userId) AND s.startTime >= :now ORDER BY s.startTime ASC")
    Page<Session> findUpcomingByUserId(@Param("userId") UUID userId, @Param("now") LocalDateTime now, Pageable pageable);

    @Query("SELECT s FROM Session s WHERE (s.mentorId = :userId OR s.learnerId = :userId) AND s.endTime < :now ORDER BY s.startTime DESC")
    Page<Session> findPastByUserId(@Param("userId") UUID userId, @Param("now") LocalDateTime now, Pageable pageable);

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

    @Query("SELECT s FROM Session s WHERE s.startTime >= :now AND s.status IN ('APPROVED', 'SCHEDULED')")
    List<Session> findSessionsForReminders(@Param("now") LocalDateTime now);

    boolean existsByMentorIdAndStartTimeAndEndTimeAndStatusNotIn(
            UUID mentorId, LocalDateTime startTime, LocalDateTime endTime, List<SessionStatus> statuses);

    // ============================================================
    // Community sessions
    // ============================================================

    @Query("SELECT s FROM Session s WHERE s.community = true AND s.status = 'SCHEDULED' AND s.startTime >= :now ORDER BY s.startTime ASC")
    Page<Session> findUpcomingCommunitySessions(@Param("now") LocalDateTime now, Pageable pageable);

    @Query("SELECT COUNT(s) FROM Session s WHERE s.community = true AND s.mentorId = :mentorId AND s.status = 'COMPLETED'")
    long countCompletedCommunityByMentor(@Param("mentorId") UUID mentorId);

    @Query("SELECT COALESCE(SUM(s.durationMinutes), 0) FROM Session s WHERE s.community = true AND s.mentorId = :mentorId AND s.status = 'COMPLETED'")
    long sumCommunityMinutesByMentor(@Param("mentorId") UUID mentorId);

    @Query("SELECT COUNT(s) FROM Session s WHERE s.community = true AND s.mentorId = :mentorId AND s.status = 'COMPLETED' AND s.startTime >= :monthStart")
    long countCompletedCommunityByMentorSince(@Param("mentorId") UUID mentorId,
                                               @Param("monthStart") LocalDateTime monthStart);

    @Query("SELECT s FROM Session s WHERE s.community = true AND s.mentorId = :mentorId AND s.status = 'COMPLETED'")
    List<Session> findCompletedCommunityByMentor(@Param("mentorId") UUID mentorId);
}
