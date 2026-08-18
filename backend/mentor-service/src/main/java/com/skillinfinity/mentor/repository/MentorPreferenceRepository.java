package com.skillinfinity.mentor.repository;

import com.skillinfinity.mentor.entity.MentorPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MentorPreferenceRepository extends JpaRepository<MentorPreference, UUID> {

    Optional<MentorPreference> findByMentorId(UUID mentorId);
}
