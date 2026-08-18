package com.skillinfinity.mentor.repository;

import com.skillinfinity.mentor.entity.Experience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MentorExperienceRepository extends JpaRepository<Experience, UUID> {

    List<Experience> findByMentorIdOrderByStartDateDesc(UUID mentorId);
}
