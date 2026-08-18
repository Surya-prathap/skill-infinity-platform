package com.skillinfinity.mentor.repository;

import com.skillinfinity.mentor.entity.MentorStatistics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MentorStatisticsRepository extends JpaRepository<MentorStatistics, UUID> {

    Optional<MentorStatistics> findByMentorId(UUID mentorId);
}
