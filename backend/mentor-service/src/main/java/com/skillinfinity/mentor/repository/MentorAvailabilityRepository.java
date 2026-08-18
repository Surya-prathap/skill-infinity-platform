package com.skillinfinity.mentor.repository;

import com.skillinfinity.mentor.entity.MentorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MentorAvailabilityRepository extends JpaRepository<MentorAvailability, UUID> {

    List<MentorAvailability> findByMentorIdOrderByDayOfWeekAsc(UUID mentorId);

    Optional<MentorAvailability> findByMentorIdAndDayOfWeek(UUID mentorId, String dayOfWeek);

    List<MentorAvailability> findByMentorIdAndActiveTrue(UUID mentorId);

    void deleteByMentorId(UUID mentorId);
}
