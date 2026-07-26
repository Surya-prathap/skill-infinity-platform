package com.skillinfinity.mentor.repository;

import com.skillinfinity.mentor.entity.TimeSlot;
import com.skillinfinity.mentor.enumeration.SlotStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, UUID> {

    List<TimeSlot> findByAvailabilityMentorId(UUID mentorId);

    List<TimeSlot> findByAvailabilityMentorIdAndDate(UUID mentorId, LocalDate date);

    List<TimeSlot> findByAvailabilityMentorIdAndStatus(UUID mentorId, SlotStatus status);

    List<TimeSlot> findByAvailabilityMentorIdAndDateBetween(UUID mentorId, LocalDate start, LocalDate end);

    @Query("SELECT t FROM TimeSlot t WHERE t.availability.mentor.id = :mentorId " +
           "AND t.date = :date AND t.startTime = :startTime AND t.endTime = :endTime")
    Optional<TimeSlot> findByMentorIdAndTimeRange(
            @Param("mentorId") UUID mentorId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);

    @Query("SELECT COUNT(t) > 0 FROM TimeSlot t WHERE t.availability.mentor.id = :mentorId " +
           "AND t.date = :date AND t.startTime < :endTime AND t.endTime > :startTime AND t.status = 'AVAILABLE'")
    boolean existsOverlappingSlot(
            @Param("mentorId") UUID mentorId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);

    void deleteByAvailabilityId(UUID availabilityId);
}
