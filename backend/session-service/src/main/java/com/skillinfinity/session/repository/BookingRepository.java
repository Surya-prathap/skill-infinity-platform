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

    Page<Booking> findByLearnerIdOrderByCreatedAtDesc(UUID learnerId, Pageable pageable);

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
}
