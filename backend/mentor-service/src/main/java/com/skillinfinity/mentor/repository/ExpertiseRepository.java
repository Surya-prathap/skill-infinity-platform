package com.skillinfinity.mentor.repository;

import com.skillinfinity.mentor.entity.Expertise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExpertiseRepository extends JpaRepository<Expertise, UUID> {

    List<Expertise> findByMentorIdOrderByDisplayOrderAsc(UUID mentorId);

    Optional<Expertise> findByMentorIdAndSkillName(UUID mentorId, String skillName);

    Optional<Expertise> findByMentorIdAndSkillId(UUID mentorId, UUID skillId);

    boolean existsByMentorIdAndSkillNameIgnoreCase(UUID mentorId, String skillName);
}
