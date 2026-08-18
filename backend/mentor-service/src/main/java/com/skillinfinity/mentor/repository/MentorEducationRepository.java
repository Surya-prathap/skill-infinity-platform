package com.skillinfinity.mentor.repository;

import com.skillinfinity.mentor.entity.Education;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MentorEducationRepository extends JpaRepository<Education, UUID> {

    List<Education> findByMentorIdOrderByStartDateDesc(UUID mentorId);
}
