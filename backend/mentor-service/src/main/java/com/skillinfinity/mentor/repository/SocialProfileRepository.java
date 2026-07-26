package com.skillinfinity.mentor.repository;

import com.skillinfinity.mentor.entity.SocialProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SocialProfileRepository extends JpaRepository<SocialProfile, UUID> {

    List<SocialProfile> findByMentorId(UUID mentorId);
}
