package com.skillinfinity.session.repository;

import com.skillinfinity.session.entity.Booking;
import com.skillinfinity.session.enumeration.BookingStatus;
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
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    Page<Booking> findByMentorIdOrderByCreatedAtDesc(UUID mentorId, Pageable pageable);

    Page<Booking> findByMentorIdInOrderByCreatedAtDesc(List<UUID> mentorIds, Pageable pageable);

    Page<Booking> findByLearnerIdOrderByCreatedAtDesc(UUID learnerId, Pageable pageable);

    Page<Booking> findByMentorIdAndStatus(UUID mentorId, BookingStatus status, Pageable pageable);

    Page<Booking> findByMentorIdInAndStatus(List<UUID> mentorIds, BookingStatus status, Pageable pageable);

    Page<Booking> findByLearnerIdAndStatus(UUID learnerId, BookingStatus status, Pageable pageable);

    List<Booking> findByMentorIdAndStatus(UUID mentorId, BookingStatus status);

    List<Booking> findByLearnerIdAndStatus(UUID learnerId, BookingStatus status);

    Optional<Booking> findBySessionId(UUID sessionId);

    @Query("SELECT b FROM Booking b WHERE b.mentorId = :userId OR b.learnerId = :userId ORDER BY b.createdAt DESC")
    Page<Booking> findByUserId(@Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.status = 'PENDING' AND b.expiresAt IS NOT NULL AND b.expiresAt < :now")
    List<Booking> findExpiredBookings(@Param("now") LocalDateTime now);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.learnerId = :learnerId AND b.createdAt >= :since")
    long countByLearnerIdSince(@Param("learnerId") UUID learnerId, @Param("since") LocalDateTime since);

    boolean existsByMentorIdAndLearnerIdAndStatus(UUID mentorId, UUID learnerId, BookingStatus status);

    @Query("SELECT COUNT(b) > 0 FROM Booking b "
            + "WHERE b.mentorId = :mentorId "
            + "AND b.status IN ('PENDING', 'APPROVED') "
            + "AND b.preferredStartTime IS NOT NULL "
            + "AND b.preferredEndTime IS NOT NULL "
            + "AND b.preferredStartTime < :endTime AND b.preferredEndTime > :startTime")
    boolean existsOverlappingBooking(@Param("mentorId") UUID mentorId,
                                     @Param("startTime") LocalDateTime startTime,
                                     @Param("endTime") LocalDateTime endTime);

    /**
     * The SAME learner's own pending/approved booking for an overlapping slot.
     * Used for booking idempotency: a retried "Book" request (e.g. after a
     * frontend timeout where the backend already committed) returns the
     * existing booking instead of creating a duplicate or freezing credits
     * twice. Other learners' bookings are deliberately excluded.
     */
    @Query("SELECT b FROM Booking b "
            + "WHERE b.mentorId = :mentorId AND b.learnerId = :learnerId "
            + "AND b.status IN ('PENDING', 'APPROVED') "
            + "AND b.preferredStartTime IS NOT NULL AND b.preferredEndTime IS NOT NULL "
            + "AND b.preferredStartTime < :endTime AND b.preferredEndTime > :startTime "
            + "ORDER BY b.createdAt DESC")
    Optional<Booking> findOverlappingByMentorAndLearner(@Param("mentorId") UUID mentorId,
                                                        @Param("learnerId") UUID learnerId,
                                                        @Param("startTime") LocalDateTime startTime,
                                                        @Param("endTime") LocalDateTime endTime);
}
